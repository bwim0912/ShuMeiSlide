# -*- coding: utf-8 -*-
from pathlib import Path
import cv2
import numpy as np
from PIL import Image


class Sliding:
    def __init__(self) -> None:
        pass

    def pil_to_cv2(self, img):
        """将 PIL.Image 对象转换为 OpenCV (BGR) 格式"""
        img = cv2.cvtColor(np.asarray(img), cv2.COLOR_RGB2BGR)
        return img

    def bytes_to_cv2(self, img):
        """将图片的字节流转换为 OpenCV 格式"""
        img_buffer_np = np.frombuffer(img, dtype=np.uint8)
        img_np = cv2.imdecode(img_buffer_np, 1)
        return img_np

    def cv2_open(self, img, flag=None):
        """
        统一的图片读取函数
        支持: bytes, str/Path, np.ndarray, PIL.Image
        """
        if isinstance(img, bytes):
            img = self.bytes_to_cv2(img)
        elif isinstance(img, (str, Path)):
            # 解决中文路径问题：用二进制读取再解码
            with open(str(img), 'rb') as f:
                buf = f.read()
            img = self.bytes_to_cv2(buf)
        elif isinstance(img, np.ndarray):
            img = img
        elif isinstance(img, Image.Image):
            img = self.pil_to_cv2(img)
        else:
            raise ValueError(f'输入的图片类型无法解析: {type(img)}')

        if flag is not None:
            img = cv2.cvtColor(img, flag)
        return img

    def getSlidingDistance(self, bgImg, tpImg, display_width=None):
        """
        计算滑动验证码的缺口横向距离
        :param bgImg: 背景图
        :param tpImg: 缺口小图
        :param display_width: 网页上背景图的实际显示宽度（像素），默认为None即返回原图距离
        :return: (横向滑动距离, 可视化结果图)
        """
        # 加载原图（彩色）用于可视化
        bg_color = self.cv2_open(bgImg)
        bg_h, bg_w = bg_color.shape[:2]

        # 加载并转为灰度图做Canny边缘检测
        bg_cv2 = self.cv2_open(bgImg, flag=cv2.COLOR_BGR2GRAY)
        bg_gray = cv2.Canny(bg_cv2, 255, 255)

        tp_cv2 = self.cv2_open(tpImg, flag=cv2.COLOR_BGR2GRAY)
        tp_gray = cv2.Canny(tp_cv2, 255, 255)

        # 获取缺口小图尺寸（用于画框）
        tp_color = self.cv2_open(tpImg)
        th, tw = tp_color.shape[:2]

        # 模板匹配
        result = cv2.matchTemplate(bg_gray, tp_gray, cv2.TM_CCOEFF_NORMED)
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
        distance_raw = max_loc[0]

        # 按显示宽度缩放
        if display_width is not None:
            scale = display_width / bg_w
            distance = round(distance_raw * scale)
            tw_scaled = round(tw * scale)
            th_scaled = round(th * scale)
        else:
            scale = 1.0
            distance = distance_raw
            tw_scaled, th_scaled = tw, th

        # 在彩色背景图上画出匹配框
        top_left = max_loc
        bottom_right = (top_left[0] + tw, top_left[1] + th)
        visual = bg_color.copy()
        cv2.rectangle(visual, top_left, bottom_right, (0, 0, 255), 2)

        # 在框上方标注距离
        label = f'Distance: {distance}px (display_width={display_width})' if display_width else f'Distance: {distance}px'
        cv2.putText(visual, label, (top_left[0], top_left[1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        return distance, visual