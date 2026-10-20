# -*- coding: utf-8 -*-
"""数美滑块验证码协议复现。

当前实现与 SDK 1.1.3 的 208 协议保持一致：
1. conf/register/fverify 使用同一轮 captchaUuid 和 rid。
2. 图片识别在 600x300 素材坐标中进行，再换算到 300x150 显示坐标。
3. fverify 加密字段由 JS 统一生成，Python 直接提交生成结果。
4. 鼠标轨迹按照 SDK 的 100ms 定时采样模型生成。
5. 只有 code=1100 且 riskLevel=PASS 才判定验证通过。
"""
import sys
import os
import json
import time
import random
import math
import execjs
import requests

#主网站url
main_url="https://www.ishumei.com/"

conf_url="https://captcha1.fengkongcloud.cn/ca/v1/conf"

register_url="https://captcha1.fengkongcloud.cn/ca/v1/register"

fverify_url="https://captcha1.fengkongcloud.cn/ca/v2/fverify"

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from 计算距离 import Sliding

headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Origin': 'https://www.ishumei.com',
    'Pragma': 'no-cache',
    'Referer': 'https://www.ishumei.com/',
    'Sec-Fetch-Dest': 'script',
    'Sec-Fetch-Mode': 'no-cors',
    'Sec-Fetch-Site': 'cross-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
}

ORGANIZATION = 'd6tpAY1oV0Kv5jRSgxQr'
APP_ID = 'default'
CHANNEL = 'default'
LANG = 'zh-cn'
R_VERSION = '1.0.4'
SDK_VER = '1.1.3'
CAPTCHA_DISPLAY_WIDTH = 300

def generate_captcha_uuid():
    """生成当前 SDK 使用的 captchaUuid: 时间戳(14位) + 随机串(18位)。"""
    ts = time.strftime("%Y%m%d%H%M%S", time.localtime())
    chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    rand_str = ''.join(
        random.choices(chars, k=18)
    )
    return ts + rand_str

def ease_out_cubic(t):
    return 1 - (1 - t) ** 3

def generate_human_mouse_track(distance):
    # 当前 SDK 在按下后立即采一个点，之后由 setInterval 每 100ms 采样。
    sample_count = random.randint(15, 24)
    mouse_data = [[0, 0, 0]]
    y = 0
    t = 0

    for i in range(1, sample_count):
        p = i / (sample_count - 1)
        x = ease_out_cubic(p) * distance
        if i < sample_count - 1:
            x += random.uniform(-0.8, 0.8)
        x = max(0, min(distance, x))
        y = max(-3, min(3, y + random.choice([-1, 0, 0, 0, 1])))
        t += random.randint(96, 104)
        mouse_data.append([int(round(x)), int(y), t])

    mouse_data[-1][0] = int(round(distance))
    # mouseup 常发生在最后一次 100ms 定时采样之后。
    total_duration_ms = t + random.randint(10, 90)
    return mouse_data, total_duration_ms


def parse_jsonp(text):
    """解析 JSON 或 JSONP，避免用 callback 名称做脆弱匹配。"""
    text = text.strip()
    if text.startswith('{'):
        return json.loads(text)
    left = text.find('(')
    right = text.rfind(')')
    if left < 0 or right <= left:
        raise ValueError(f"响应不是有效 JSONP: {text[:200]}")
    return json.loads(text[left + 1:right])

def get_callback():
    """生成带随机后缀的callback，防止时间戳重复"""
    return f"sm_{int(time.time() * 1000)}{random.randint(100,999)}"

def main():
    #获取当前 py 文件所在文件夹路径
    base_dir=os.path.dirname(os.path.abspath(__file__))

    #创建requests会话，保存cookie
    session=requests.Session()

    #----------------------------1----------------------
    #生成全局captchaUuid
    captchaUuid=generate_captcha_uuid()
    print(f"captchaUuid-{captchaUuid}")

    #----------------------------2----------------------
    print("第一步:正在访问数美网站...")
    try:
        session.get(main_url,headers=headers,timeout=10)
    except Exception as e:
        print(f"忽略{e}")
    time.sleep(random.uniform(0.5,1.2))

    # ----------------------------3-----------------------
    print("第二步:请求conf接口...")
    conf_params = {
        'appId': APP_ID,
        'rversion': R_VERSION,
        'channel': CHANNEL,
        'model': 'slide',
        'lang': LANG,
        'organization': ORGANIZATION,
        'callback': get_callback(),
        'captchaUuid': captchaUuid,
        'sdkver': SDK_VER,
    }
    try:
        session.get(conf_url, params=conf_params, headers=headers, timeout=10)
    except Exception as e:
        print(f"忽略{e}")
    time.sleep(random.uniform(0.3,0.8))

    # ----------------------------4-----------------------
    print("第三步：调用register接口，获取图片与rid...")
    reg_params = {
        'appId': APP_ID,
        'model': 'slide',
        'lang': LANG,
        'callback': get_callback(),
        'organization': ORGANIZATION,
        'captchaUuid': captchaUuid,  # 和conf完全一样！
        'rversion': R_VERSION,
        'data': '{}',
        'channel': CHANNEL,
        'sdkver': SDK_VER,
    }
    resp=session.get(register_url,params=reg_params,headers=headers,timeout=10)
    # ----------------------------5-----------------------
    raw_text=resp.text
    res_data=parse_jsonp(raw_text)

    if res_data.get('code')!=1100:
        print(f"注册失败:{raw_text}")
        return
    detail=res_data["detail"]
    print(f"注册成功:rid={detail['rid']},原图={detail['bg_width']}x{detail['bg_height']}")

    # ----------------------------6-----------------------
    print("第四步:下载验证码图片...")
    img_domain = detail["domains"][0]
    bg_url = f"https://{img_domain}{detail['bg']}"
    fg_url = f"https://{img_domain}{detail['fg']}"
    bg_path = os.path.join(base_dir, "bg.jpg")
    fg_path = os.path.join(base_dir, "fg.png")
    with open(bg_path, "wb") as f:
        f.write(session.get(bg_url, headers=headers, timeout=10).content)
    with open(fg_path, "wb") as f:
        f.write(session.get(fg_url, headers=headers, timeout=10).content)

    # ----------------------------7-----------------------
    print("第五步:计算滑动距离...")
    sliding=Sliding()
    raw_distance,visual=sliding.getSlidingDistance(bg_path,fg_path,display_width=None)
    bg_width = detail['bg_width']
    bg_height = detail['bg_height']
    true_width = CAPTCHA_DISPLAY_WIDTH
    true_height = round(bg_height * true_width / bg_width)
    distance = round(raw_distance * true_width / bg_width)
    print(
        f"原图尺寸:{bg_width}x{bg_height},原图距离:{raw_distance},"
        f"显示尺寸:{true_width}x{true_height},提交距离:{distance}"
    )
    try:
        import cv2
        out_path = os.path.join(base_dir, "result.jpg")
        ret, buf = cv2.imencode('.jpg', visual)
        with open(out_path, 'wb') as f:
            f.write(buf.tobytes())
        print(f"   可视化图: {out_path}")
    except Exception as e:
        print(f"   保存失败: {e}")
    #模拟人思考等待
    think_delay=random.uniform(0.6,1.4)
    print(f"第六步:等待{think_delay:.2f}s")
    time.sleep(think_delay)

    # ---------- 8. 生成鼠标轨迹 ----------
    print("第七步:生成拟人轨迹...")
    start_time = time.time()
    # 获取鼠标按下绝对时间戳(毫秒)
    start_time_ms = int(start_time * 1000)

    mouse_data, total_duration_ms = generate_human_mouse_track(distance)
    end_time_ms = start_time_ms + total_duration_ms

    #打印调试信息：轨迹点数量、总耗时，首尾轨迹点，用来排查轨迹是否异常
    print(f"   轨迹点数: {len(mouse_data)}, 耗时: {total_duration_ms}ms")
    print(f"   前3点: {mouse_data[:3]}")
    print(f"   后3点: {mouse_data[-3:]}")

    # ---------- 9. execjs调用JS加密 ----------
    print("第八步:execjs调用JS加密生成fverify参数")
    js_input_obj = {
        "config": {
            "organization": ORGANIZATION,
            "appId": APP_ID,
            "channel": CHANNEL,
            "lang": LANG,
            "VERSION": R_VERSION,
            "SDKVER": SDK_VER,
            "protocol": "208",
            "ostype": "web",
            # 删除 "safeParams": "10",
            "mode": "slide"
        },
        "registerData": {
            "rid": detail["rid"],
            "k": detail["k"],
            "l": detail["l"]
        },
        "data": {
            "mouseData": mouse_data,
            "startTime": start_time_ms,
            "endTime": end_time_ms,
            "trueWidth": true_width,
            "trueHeight": true_height,
            "mouseEndX": distance,
            "blockWidth": true_width / 300 * 40,
        },
        "options": {
            "isBrowser": True,     # ← 改成 True（因为你要伪装成浏览器）
            "hookTest": False,
            "isMobile": False,
            "console": 0,
            "botDetection": 0
        }
    }    # 把组装好的全部明文数据转JSON字符串，传给JS入口函数
    js_input_str = json.dumps(js_input_obj, ensure_ascii=False)

    ret_str = ctx.call("runFromPython", js_input_str)
    encrypt_result = json.loads(ret_str)
    print("JS加密输出：", encrypt_result)

    # ---------- 10. fverify提交校验 ----------
    print("第九步: 请求 fverify 提交校验")
    fv_params = {
        'callback': get_callback(),
        'captchaUuid': captchaUuid,
        **encrypt_result,
    }
    resp_fv = session.get(fverify_url, params=fv_params, headers=headers, timeout=10)
    print("fverify原始返回：", resp_fv.text)

    #解析jsonp结果
    try:
        fv_data = parse_jsonp(resp_fv.text)
        print("验证结果：", fv_data)
        if fv_data.get("code") == 1100 and fv_data.get("riskLevel") == "PASS":
            print("滑块验证成功 rid =", detail["rid"])
        else:
            print(
                "验证失败: code=", fv_data.get("code"),
                "riskLevel=", fv_data.get("riskLevel"),
                "message=", fv_data.get("message"),
            )
    except Exception as e:
        print("fverify jsonp解析失败", e)

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    js_path = os.path.join(base_dir, "数美js_code.js")
    with open(js_path, "r", encoding="utf-8") as f:
        js_code = f.read()
    ctx = execjs.compile(js_code)
    main()
