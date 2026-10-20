// ============================================================ // 1. Base64 解码 // ============================================================
function base64Decode(str) {
    var map = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
    var a, b, c, d, i, len, result;
    len = str.length;
    i = 0;
    result = '';
    while (i < len) {
        do { a = map[str.charCodeAt(i++) & 255]; } while (i < len && a == -1);
        if (a == -1) break;
        do { b = map[str.charCodeAt(i++) & 255]; } while (i < len && b == -1);
        if (b == -1) break;
        result += String.fromCharCode(a << 2 | (b & 48) >> 4);
        do {
            c = str.charCodeAt(i++) & 255;
            if (c == 61) return result;
            c = map[c];
        } while (i < len && c == -1);
        if (c == -1) break;
        result += String.fromCharCode((b & 15) << 4 | (c & 60) >> 2);
        do {
            d = str.charCodeAt(i++) & 255;
            if (d == 61) return result;
            d = map[d];
        } while (i < len && d == -1);
        if (d == -1) break;
        result += String.fromCharCode((c & 3) << 6 | d);
    }
    return result;
}

// ============================================================ // 2. Base64 编码 // ============================================================
function base64Encode(str) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var len, i, c1, c2, c3, result;
    len = str.length;
    i = 0;
    result = '';
    while (i < len) {
        c1 = str.charCodeAt(i++) & 255;
        if (i == len) {
            result += chars.charAt(c1 >> 2);
            result += chars.charAt((c1 & 3) << 4);
            result += '==';
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            result += chars.charAt(c1 >> 2);
            result += chars.charAt((c1 & 3) << 4 | (c2 & 240) >> 4);
            result += chars.charAt((c2 & 15) << 2);
            result += '=';
            break;
        }
        c3 = str.charCodeAt(i++);
        result += chars.charAt(c1 >> 2);
        result += chars.charAt((c1 & 3) << 4 | (c2 & 240) >> 4);
        result += chars.charAt((c2 & 15) << 2 | (c3 & 192) >> 6);
        result += chars.charAt(c3 & 63);
    }
    return result;
}

// ============================================================ // 3. DES 密钥扩展 // ============================================================
function desKeySchedule(key) {
    var t1 = new Array(0, 4, 536870912, 536870916, 65536, 65540, 536936448, 536936452, 512, 516, 536871424, 536871428, 66048, 66052, 536936960, 536936964);
    var t2 = new Array(0, 1, 1048576, 1048577, 67108864, 67108865, 68157440, 68157441, 256, 257, 1048832, 1048833, 67109120, 67109121, 68157696, 68157697);
    var t3 = new Array(0, 8, 2048, 2056, 16777216, 16777224, 16779264, 16779272, 0, 8, 2048, 2056, 16777216, 16777224, 16779264, 16779272);
    var t4 = new Array(0, 2097152, 134217728, 136314880, 8192, 2105344, 134225920, 136323072, 131072, 2228224, 134348800, 136445952, 139264, 2236416, 134356992, 136454144);
    var t5 = new Array(0, 262144, 16, 262160, 0, 262144, 16, 262160, 4096, 266240, 4112, 266256, 4096, 266240, 4112, 266256);
    var t6 = new Array(0, 1024, 32, 1056, 0, 1024, 32, 1056, 33554432, 33555456, 33554464, 33555488, 33554432, 33555456, 33554464, 33555488);
    var t7 = new Array(0, 268435456, 524288, 268959744, 2, 268435458, 524290, 268959746, 0, 268435456, 524288, 268959744, 2, 268435458, 524290, 268959746);
    var t8 = new Array(0, 65536, 2048, 67584, 536870912, 536936448, 536872960, 536938496, 131072, 196608, 133120, 198656, 537001984, 537067520, 537004032, 537069568);
    var t9 = new Array(0, 262144, 0, 262144, 2, 262146, 2, 262146, 33554432, 33816576, 33554432, 33816576, 33554434, 33816578, 33554434, 33816578);
    var t10 = new Array(0, 268435456, 8, 268435464, 0, 268435456, 8, 268435464, 1024, 268436480, 1032, 268436488, 1024, 268436480, 1032, 268436488);
    var t11 = new Array(0, 32, 0, 32, 1048576, 1048608, 1048576, 1048608, 8192, 8224, 8192, 8224, 1056768, 1056800, 1056768, 1056800);
    var t12 = new Array(0, 16777216, 512, 16777728, 2097152, 18874368, 2097664, 18874880, 67108864, 83886080, 67109376, 83886592, 69206016, 85983232, 69206528, 85983744);
    var t13 = new Array(0, 4096, 134217728, 134221824, 524288, 528384, 134742016, 134746112, 16, 4112, 134217744, 134221840, 524304, 528400, 134742032, 134746128);
    var t14 = new Array(0, 4, 256, 260, 0, 4, 256, 260, 1, 5, 257, 261, 1, 5, 257, 261);
    var iterations = key.length > 8 ? 3 : 1;
    var keys = new Array(32 * iterations);
    var shifts = new Array(0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0);
    var left, right, temp, k, i, j;
    var pos = 0;
    var keyPos = 0;
    for (j = 0; j < iterations; j++) {
        left = key.charCodeAt(keyPos++) << 24 | key.charCodeAt(keyPos++) << 16 | key.charCodeAt(keyPos++) << 8 | key.charCodeAt(keyPos++);
        right = key.charCodeAt(keyPos++) << 24 | key.charCodeAt(keyPos++) << 16 | key.charCodeAt(keyPos++) << 8 | key.charCodeAt(keyPos++);
        temp = (left >>> 4 ^ right) & 252645135;
        right ^= temp;
        left ^= temp << 4;
        temp = (right >>> -16 ^ left) & 65535;
        left ^= temp;
        right ^= temp << -16;
        temp = (left >>> 2 ^ right) & 858993459;
        right ^= temp;
        left ^= temp << 2;
        temp = (right >>> -16 ^ left) & 65535;
        left ^= temp;
        right ^= temp << -16;
        temp = (left >>> 1 ^ right) & 1431655765;
        right ^= temp;
        left ^= temp << 1;
        temp = (right >>> 8 ^ left) & 16711935;
        left ^= temp;
        right ^= temp << 8;
        temp = (left >>> 1 ^ right) & 1431655765;
        right ^= temp;
        left ^= temp << 1;
        temp = left << 8 | right >>> 20 & 240;
        left = right << 24 | right << 8 & 16711680 | right >>> 8 & 65280 | right >>> 24 & 240;
        right = temp;
        for (i = 0; i < shifts.length; i++) {
            if (shifts[i]) {
                left = left << 2 | left >>> 26;
                right = right << 2 | right >>> 26;
            } else {
                left = left << 1 | left >>> 27;
                right = right << 1 | right >>> 27;
            }
            left &= -15;
            right &= -15;
            var a = t1[left >>> 28] | t2[left >>> 24 & 15] | t3[left >>> 20 & 15] | t4[left >>> 16 & 15] | t5[left >>> 12 & 15] | t6[left >>> 8 & 15] | t7[left >>> 4 & 15];
            var b = t8[right >>> 28] | t9[right >>> 24 & 15] | t10[right >>> 20 & 15] | t11[right >>> 16 & 15] | t12[right >>> 12 & 15] | t13[right >>> 8 & 15] | t14[right >>> 4 & 15];
            temp = (b >>> 16 ^ a) & 65535;
            keys[pos++] = a ^ temp;
            keys[pos++] = b ^ temp << 16;
        }
    }
    return keys;
}

// ============================================================ // 4. DES 加解密主体 // ============================================================
function desCrypt(key, message, encrypt, mode, iv, padding) {
    var s1 = new Array(16843776, 0, 65536, 16843780, 16842756, 66564, 4, 65536, 1024, 16843776, 16843780, 1024, 16778244, 16842756, 16777216, 4, 1028, 16778240, 16778240, 66560, 66560, 16842752, 16842752, 16778244, 65540, 16777220, 16777220, 65540, 0, 1028, 66564, 16777216, 65536, 16843780, 4, 16842752, 16843776, 16777216, 16777216, 1024, 16842756, 65536, 66560, 16777220, 1024, 4, 16778244, 66564, 16843780, 65540, 16842752, 16778244, 16777220, 1028, 66564, 16843776, 1028, 16778240, 16778240, 0, 65540, 66560, 0, 16842756);
    var s2 = new Array(-2146402272, -2147450880, 32768, 1081376, 1048576, 32, -2146435040, -2147450848, -2147483616, -2146402272, -2146402304, -2147483648, -2147450880, 1048576, 32, -2146435040, 1081344, 1048608, -2147450848, 0, -2147483648, 32768, 1081376, -2146435072, 1048608, -2147483616, 0, 1081344, 32800, -2146402304, -2146435072, 32800, 0, 1081376, -2146435040, 1048576, -2147450848, -2146435072, -2146402304, 32768, -2146435072, -2147450880, 32, -2146402272, 1081376, 32, 32768, -2147483648, 32800, -2146402304, 1048576, -2147483616, 1048608, -2147450848, -2147483616, 1048608, 1081344, 0, -2147450880, 32800, -2147483648, -2146435040, -2146402272, 1081344);
    var s3 = new Array(520, 134349312, 0, 134348808, 134218240, 0, 131592, 134218240, 131080, 134217736, 134217736, 131072, 134349320, 131080, 134348800, 520, 134217728, 8, 134349312, 512, 131584, 134348800, 134348808, 131592, 134218248, 131584, 131072, 134218248, 8, 134349320, 512, 134217728, 134349312, 134217728, 131080, 520, 131072, 134349312, 134218240, 0, 512, 131080, 134349320, 134218240, 134217736, 512, 0, 134348808, 134218248, 131072, 134217728, 134349320, 8, 131592, 131584, 134217736, 134348800, 134218248, 520, 134348800, 131592, 8, 134348808, 131584);
    var s4 = new Array(8396801, 8321, 8321, 128, 8396928, 8388737, 8388609, 8193, 0, 8396800, 8396800, 8396929, 129, 0, 8388736, 8388609, 1, 8192, 8388608, 8396801, 128, 8388608, 8193, 8320, 8388737, 1, 8320, 8388736, 8192, 8396928, 8396929, 129, 8388736, 8388609, 8396800, 8396929, 129, 0, 0, 8396800, 8320, 8388736, 8388737, 1, 8396801, 8321, 8321, 128, 8396929, 129, 1, 8192, 8388609, 8193, 8396928, 8388737, 8193, 8320, 8388608, 8396801, 128, 8388608, 8192, 8396928);
    var s5 = new Array(256, 34078976, 34078720, 1107296512, 524288, 256, 1073741824, 34078720, 1074266368, 524288, 33554688, 1074266368, 1107296512, 1107820544, 524544, 1073741824, 33554432, 1074266112, 1074266112, 0, 1073742080, 1107820800, 1107820800, 33554688, 1107820544, 1073742080, 0, 1107296256, 34078976, 33554432, 1107296256, 524544, 524288, 1107296512, 256, 33554432, 1073741824, 34078720, 1107296512, 1074266368, 33554688, 1073741824, 1107820544, 34078976, 1074266368, 256, 33554432, 1107820544, 1107820800, 524544, 1107296256, 1107820800, 34078720, 0, 1074266112, 1107296256, 524544, 33554688, 1073742080, 524288, 0, 1074266112, 34078976, 1073742080);
    var s6 = new Array(536870928, 541065216, 16384, 541081616, 541065216, 16, 541081616, 4194304, 536887296, 4210704, 4194304, 536870928, 4194320, 536887296, 536870912, 16400, 0, 4194320, 536887312, 16384, 4210688, 536887312, 16, 541065232, 541065232, 0, 4210704, 541081600, 16400, 4210688, 541081600, 536870912, 536887296, 16, 541065232, 4210688, 541081616, 4194304, 16400, 536870928, 4194304, 536887296, 536870912, 16400, 536870928, 541081616, 4210688, 541065216, 4210704, 541081600, 0, 541065232, 16, 16384, 541065216, 4210704, 16384, 4194320, 536887312, 0, 541081600, 536870912, 4194320, 536887312);
    var s7 = new Array(2097152, 69206018, 67110914, 0, 2048, 67110914, 2099202, 69208064, 69208066, 2097152, 0, 67108866, 2, 67108864, 69206018, 2050, 67110912, 2099202, 2097154, 67110912, 67108866, 69206016, 69208064, 2097154, 69206016, 2048, 2050, 69208066, 2099200, 2, 67108864, 2099200, 67108864, 2099200, 2097152, 67110914, 67110914, 69206018, 69206018, 2, 2097154, 67108864, 67110912, 2097152, 69208064, 2050, 2099202, 69208064, 2050, 67108866, 69208066, 69206016, 2099200, 0, 2, 69208066, 0, 2099202, 69206016, 2048, 67108866, 67110912, 2048, 2097154);
    var s8 = new Array(268439616, 4096, 262144, 268701760, 268435456, 268439616, 64, 268435456, 262208, 268697600, 268701760, 266240, 268701696, 266304, 4096, 64, 268697600, 268435520, 268439552, 4160, 266240, 262208, 268697664, 268701696, 4160, 0, 0, 268697664, 268435520, 268439552, 266304, 262144, 266304, 262144, 268701696, 4096, 64, 268697664, 4096, 266304, 268439552, 64, 268435520, 268697600, 268697664, 268435456, 262144, 268439616, 0, 268701760, 262208, 268435520, 268697600, 268439552, 268439616, 0, 268701760, 266240, 266240, 4160, 4160, 262208, 268435456, 268701696);
    var subKeys = desKeySchedule(key);
    var pos = 0;
    var left, right, temp, temp2;
    var iterations = subKeys.length == 32 ? 3 : 9;
    var loopArr;
    if (iterations == 3) {
        loopArr = encrypt ? new Array(0, 32, 2) : new Array(30, -2, -2);
    } else {
        loopArr = encrypt ? new Array(0, 32, 2, 62, 30, -2, 64, 96, 2) : new Array(94, 62, -2, 32, 64, 2, 30, -2, -2);
    }
    var messageLen = message.length;
    if (padding == 2) {
        message += "        ";
    } else if (padding == 1) {
        temp = 8 - message.length % 8;
        message += String.fromCharCode(temp, temp, temp, temp, temp, temp, temp, temp);
        if (temp == 8) messageLen += 8;
    } else if (!padding) {
        message += "\0\0\0\0\0\0\0\0";
    }
    var result = '';
    var tempResult = '';
    var ivLeft, ivRight;
    if (mode == 1) {
        ivLeft = iv.charCodeAt(pos++) << 24 | iv.charCodeAt(pos++) << 16 | iv.charCodeAt(pos++) << 8 | iv.charCodeAt(pos++);
        ivRight = iv.charCodeAt(pos++) << 24 | iv.charCodeAt(pos++) << 16 | iv.charCodeAt(pos++) << 8 | iv.charCodeAt(pos++);
        pos = 0;
    }
    while (pos < messageLen) {
        left = message.charCodeAt(pos++) << 24 | message.charCodeAt(pos++) << 16 | message.charCodeAt(pos++) << 8 | message.charCodeAt(pos++);
        right = message.charCodeAt(pos++) << 24 | message.charCodeAt(pos++) << 16 | message.charCodeAt(pos++) << 8 | message.charCodeAt(pos++);
        if (mode == 1) {
            if (encrypt) {
                left ^= ivLeft;
                right ^= ivRight;
            } else {
                temp = ivLeft;
                temp2 = ivRight;
                ivLeft = left;
                ivRight = right;
            }
        }
        temp = (left >>> 4 ^ right) & 252645135;
        right ^= temp;
        left ^= temp << 4;
        temp = (left >>> 16 ^ right) & 65535;
        right ^= temp;
        left ^= temp << 16;
        temp = (right >>> 2 ^ left) & 858993459;
        left ^= temp;
        right ^= temp << 2;
        temp = (right >>> 8 ^ left) & 16711935;
        left ^= temp;
        right ^= temp << 8;
        temp = (left >>> 1 ^ right) & 1431655765;
        right ^= temp;
        left ^= temp << 1;
        left = left << 1 | left >>> 31;
        right = right << 1 | right >>> 31;
        for (var i = 0; i < iterations; i += 3) {
            var end = loopArr[i + 1];
            var step = loopArr[i + 2];
            for (var j = loopArr[i]; j != end; j += step) {
                temp = right ^ subKeys[j];
                temp2 = (right >>> 4 | right << 28) ^ subKeys[j + 1];
                var t = left;
                left = right;
                right = t ^ (s2[temp >>> 24 & 63] | s4[temp >>> 16 & 63] | s6[temp >>> 8 & 63] | s8[temp & 63] | s1[temp2 >>> 24 & 63] | s3[temp2 >>> 16 & 63] | s5[temp2 >>> 8 & 63] | s7[temp2 & 63]);
            }
            temp = left;
            left = right;
            right = temp;
        }
        left = left >>> 1 | left << 31;
        right = right >>> 1 | right << 31;
        temp = (left >>> 1 ^ right) & 1431655765;
        right ^= temp;
        left ^= temp << 1;
        temp = (right >>> 8 ^ left) & 16711935;
        left ^= temp;
        right ^= temp << 8;
        temp = (right >>> 2 ^ left) & 858993459;
        left ^= temp;
        right ^= temp << 2;
        temp = (left >>> 16 ^ right) & 65535;
        right ^= temp;
        left ^= temp << 16;
        temp = (left >>> 4 ^ right) & 252645135;
        right ^= temp;
        left ^= temp << 4;
        if (mode == 1) {
            if (encrypt) {
                ivLeft = left;
                ivRight = right;
            } else {
                left ^= temp;
                right ^= temp2;
            }
        }
        tempResult += String.fromCharCode(left >>> 24, left >>> 16 & 255, left >>> 8 & 255, left & 255, right >>> 24, right >>> 16 & 255, right >>> 8 & 255, right & 255);
        if (tempResult.length == 512) {
            result += tempResult;
            tempResult = '';
        }
    }
    return result + tempResult;
}

function DES(key, message, encrypt, mode) {
    return desCrypt(key, message, encrypt, mode, null, null);
}

function smStringify(value, escapeUnicode) {
    var type = typeof value;
    var primitiveTypes = {
        number: true,
        boolean: true,
        undefined: true,
        string: true,
        function: true
    };
    var result;

    if (primitiveTypes[type]) {
        if (type === "undefined") {
            result = "undefined";
        } else if (type === "string" || type === "function") {
            result = '"' + String(value).replace('"', '\\"') + '"';
        } else {
            result = String(value);
        }
    } else if (Array.isArray(value)) {
        result = '[' + value.map(function (item) {
            return typeof item === "undefined" ? "null" : smStringify(item, false);
        }).join(",") + ']';
    } else if (value !== null && type === "object") {
        var pairs = [];
        for (var key in value) {
            if (typeof value[key] !== "undefined") {
                pairs.push('"' + key + '":' + smStringify(value[key], false));
            }
        }
        result = '{' + pairs.join(",") + '}';
    } else {
        result = "null";
    }

    if (escapeUnicode) {
        result = result.replace(/[^\x00-\xff]/g, function (char) {
            return "\\u" + char.charCodeAt(0).toString(16);
        });
    }
    return result;
}

function getEncryptContent(content, key) {
    var plaintext = (typeof content === "string") ? content : smStringify(content, false);
    return base64Encode(DES(key, plaintext, 1, 0));
}

function getSafeParams(isBrowser, hookTest) {
    var browserFlag = isBrowser ? "1" : "0";
    var hookFlag = browserFlag === "1" && hookTest ? "1" : "0";
    return browserFlag + hookFlag;
}

function getOs(options) {
    options = options || {};
    var customOs = options.os || (options.customData && options.customData.os);
    if (customOs) {
        return String(customOs).toLocaleLowerCase();
    }
    return options.isMobile ? "web_mobile" : "web_pc";
}

function assertFiniteNumber(name, value) {
    if (typeof value !== "number" || !isFinite(value)) {
        throw new TypeError(name + " must be a finite number");
    }
}

function buildMouseActionParams(mode, data, registerData, options) {
    data = data || {};
    registerData = registerData || {};
    options = options || {};

    if (!registerData.k || registerData.l === undefined) {
        throw new Error("registerData.k and registerData.l are required");
    }

    var registerKey = DES(
        "sshummei",
        base64Decode(registerData.k),
        0,
        0
    ).substr(0, Number(registerData.l));
    var mouseData = data.mouseData === undefined ? [] : data.mouseData;
    var startTime = data.startTime;
    var endTime = data.endTime;
    var trueWidth = data.trueWidth;
    var trueHeight = data.trueHeight;
    var mouseEndX = data.mouseEndX === undefined ? 0 : data.mouseEndX;
    var blockWidth = data.blockWidth === undefined ? 0 : data.blockWidth;
    var result = {};
    var encrypt = getEncryptContent;

    assertFiniteNumber("startTime", startTime);
    assertFiniteNumber("endTime", endTime);
    assertFiniteNumber("trueWidth", trueWidth);
    assertFiniteNumber("trueHeight", trueHeight);
    assertFiniteNumber("mouseEndX", mouseEndX);
    assertFiniteNumber("blockWidth", blockWidth);

    switch (mode) {
        case "select":
        case "icon_select":
        case "seq_select":
        case "spatial_select":
            result.fg = encrypt(data.selectData === undefined ? [] : data.selectData, "f0bc37a3");
            result.hb = encrypt(mouseData, "2f9e63ce");
            result.nr = encrypt(endTime - startTime, "8037553d");
            result.hk = encrypt(trueWidth, "f86cf74b");
            result.iq = encrypt(trueHeight, "69229422");
            result["act.os"] = getOs(options);
            break;
        case "slide":
            result.mv = encrypt(trueWidth === 0 ? 0 : mouseEndX / trueWidth, "8be38c2a");
            result.hb = encrypt(mouseData, "2f9e63ce");
            result.nr = encrypt(endTime - startTime, "8037553d");
            result.hk = encrypt(trueWidth, "f86cf74b");
            result.iq = encrypt(trueHeight, "69229422");
            result["act.os"] = getOs(options);
            break;
        case "auto_slide":
            result.mv = encrypt(mouseEndX / (trueWidth - blockWidth), "8be38c2a");
            result.hb = encrypt(mouseData, "2f9e63ce");
            result.nr = encrypt(endTime - startTime, "8037553d");
            result.hk = encrypt(trueWidth, "f86cf74b");
            result.iq = encrypt(trueHeight, "69229422");
            result["act.os"] = getOs(options);
            break;
        default:
            throw new Error("unsupported mode: " + mode);
    }

    result.oc = encrypt(options.console === undefined ? 0 : options.console, "da5173ae");
    result.tk = encrypt(options.botDetection === undefined ? 0 : options.botDetection, "bc897b9e");
    result.xu = encrypt(-1, "84d5042c");

    return {
        params: result,
        key: registerKey
    };
}

var DEFAULT_CONFIG = {
    organization: "",
    appId: "default",
    channel: "default",
    lang: "zh-cn",
    VERSION: "1.0.4",
    SDKVER: "1.1.3",
    protocol: "208",
    ostype: "web",
    safeParams: "10",
    mode: "slide"
};

function buildRequestParams(config, registerData, data, options) {
    config = Object.assign({}, DEFAULT_CONFIG, config || {});
    registerData = registerData || {};
    options = options || {};

    var safeParams = config.safeParams;
    if (safeParams === undefined || safeParams === null) {
        safeParams = getSafeParams(options.isBrowser, options.hookTest);
    }

    var result = {
        organization: config.organization,
        qp: getEncryptContent(config.appId, "18a1bc4f"),
        ij: getEncryptContent(config.channel, "26fdba69"),
        kx: getEncryptContent(config.lang, "b1def817"),
        xh: getEncryptContent(String(safeParams), "384e9dde"),
        rid: registerData.rid === undefined ? (config.rid || "") : registerData.rid,
        rversion: config.VERSION,
        sdkver: config.SDKVER,
        protocol: config.protocol,
        ostype: config.ostype
    };

    if (registerData.k !== undefined && registerData.l !== undefined) {
        var action = buildMouseActionParams(config.mode, data, registerData, options);
        Object.assign(result, action.params);
    }
    return result;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        DES: DES,
        base64Decode: base64Decode,
        base64Encode: base64Encode,
        smStringify: smStringify,
        getEncryptContent: getEncryptContent,
        getSafeParams: getSafeParams,
        getOs: getOs,
        buildMouseActionParams: buildMouseActionParams,
        buildRequestParams: buildRequestParams,
        DEFAULT_CONFIG: DEFAULT_CONFIG
    };
}

// ============================================================
// PyExecJS 入口：Python 通过 ctx.call("runFromPython", jsonStr) 调用
// ============================================================
function runFromPython(inputJsonStr) {
    var inputData = JSON.parse(inputJsonStr);
    var result = buildRequestParams(
        inputData.config,
        inputData.registerData,
        inputData.data,
        inputData.options
    );
    return JSON.stringify(result);
}
