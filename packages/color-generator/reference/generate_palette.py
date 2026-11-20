"""
Vapor Primitive 컬러 팔레트 기준 스크립트

- 이 스크립트의 출력이 최종 팔레트 값의 기준(정답)임
- 입력값(목표 명암비, Leonardo 키 컬러, 옐로우 계열 범위, dark 400 채도 계수)만 바꾸면 전체 팔레트가 다시 계산됨
- 실행: python3 generate_palette.py  → palette.json 생성
- 명암비: 반올림 전 색으로 목표 명암비를 맞추고, HEX는 각 칸 마지막에 한 번만 반올림함 (반올림 방식)
  → HEX 명암비는 목표와 셋째 자리에서 조금 다를 수 있음, 표기는 항상 실제 명암비를 소수점 셋째 자리까지
- gray는 이 스크립트 대상이 아님 (명암비로 별도 정의된 고정값)

계산 순서
1. 색조: LEONARDO_KEYS(색마다 키 컬러) → 흰색·키 컬러·검정을 OKLCH로 보간 → 각 칸 light 목표 명암비 지점의 색조
2. light 050~200: 기준 11색 공통 최대 채도(옐로우 계열은 따로) → 목표 명암비가 되는 명도 → HEX 확정
3. light 400~900: 표현 가능한 최대 채도 → 명도 → HEX 확정
4. light 300: 확정된 200·400 HEX의 중간 채도 → 명도 → HEX 확정
5. dark 400~900: 확정된 light HEX에서 같은 명도의 채도·색조를 가져옴 (400은 채도 ×0.9) → HEX 확정
6. dark 050~300: dark 400의 색조 + 공통 채도 규칙 → HEX 확정
7. 검사 (아래)

시각 보정은 이 스크립트에 넣지 않음
- 스크립트 출력은 항상 시각 보정 전 팔레트
- 시각 보정은 출력과 검사 결과를 본 뒤 디자이너가 스크립트 밖(Figma)에서 하고, 디자인 의사결정 노트에 기록
- 보정한 값은 실행 중에 입력하거나 파일로 넘겨서 7단계 검사를 다시 받음 (값은 스크립트에 저장하지 않음)
  - 실행 후 "시각 보정한 값을 검사할까요?"에 y → 보정한 칸을 한 줄씩 입력 (예: light orange 800 701800)
  - 파일로 검사: python3 generate_palette.py --check 보정.json
    (보정.json 형식: {"light": {"orange": {"800": "701800"}}, "dark": {...}}, 바꾼 칸만 넣어도 됨)
  - 검사 통과 후 저장하면 palette_corrected.json으로 따로 저장 (palette.json은 그대로), 실패 항목이 있으면 저장하지 않음

새 색 추가
- NEW_COLORS에 이름과 HEX 하나를 넣고 실행 (키 컬러 목록을 직접 넣어도 됨)
  - 파일을 고치지 않고 실행할 때만 넣으려면: python3 generate_palette.py --new teal=00838F
    (키 컬러 3개: --new teal=9ED8FF,0068F4,001A6E, 여러 색은 --new를 여러 번)
  - HEX 하나면: 500 색조가 가장 가까운 기준 색의 키 컬러를 색조만 돌려서 쓰고, 명도가 가장 가까운 키를 입력 HEX로 바꿈
- 검사에서 경고가 나온 칸은 스크립트 밖(Figma)에서 시각 보정하고 이유를 기록
- 050~200 최대 채도는 기준 11색(BASE_COLORS)으로만 정해져 고정됨 → 새 색을 넣어도 기존 색 값은 바뀌지 않음
- 실행하면 검사 결과가 함께 출력됨
  1. 인접 색 간격: 같은 스케일에서 다른 색과 색조 5.5° 이상 (blue·cobalt는 예외)
     → 막지 않고 경고만 함, 비슷해 보일 수 있는 색을 알려주고 저장할지 물어봄
     → 의도한 조합이면 HUE_GAP_EXCEPTIONS에 추가하면 다음부터 경고하지 않음
  2. 명암비: 목표 명암비 ±1% 이내, 접근성 기준(3:1·4.5:1) 통과
  3. 채도 규칙: 각 칸의 채도가 2~6단계 규칙대로인지 (그 칸의 명도·색조 기준, HEX 반올림 차이만 허용)
     → 스크립트가 만든 팔레트는 항상 통과, 시각 보정한 팔레트를 검사할 때 의미가 있음
"""
import json
import math
import sys

# ---------------------------------------------------------------------------
# 입력값
# ---------------------------------------------------------------------------
SCALES = ["050", "100", "200", "300", "400", "500", "600", "700", "800", "900"]

# 목표 명암비 (Figma 표 v2, 소수점 셋째 자리 그대로)
TARGET_LIGHT = dict(zip(SCALES, [1.140, 1.308, 1.708, 2.270, 3.234, 4.881, 6.585, 8.587, 11.549, 15.134]))  # #FFFFFF 대비
TARGET_DARK = dict(zip(SCALES, [1.120, 1.350, 1.750, 2.300, 3.420, 5.250, 6.800, 8.600, 10.900, 13.500]))   # #232323 대비
BG_LIGHT = "FFFFFF"
BG_DARK = "232323"

# ---- 색조: Leonardo 키 컬러 ----
# 색마다 Leonardo 키 컬러 (흰색 → 키 컬러 → 검정을 OKLCH로 보간, 각 칸 목표 명암비 지점의 색조가 기본 색조)
# 기존 11색 키 컬러는 Foundation 2.0(예전 Leonardo 출력)에서 역추정한 값, 원래 설정값은 아님
LEONARDO_KEYS = {
    "red":    ["F8636A", "BB1225", "9E0006"],
    "orange": ["EF6F25", "B72100", "9E0000"],
    "yellow": ["FBBD05", "8D4F00", "4D1100"],
    "pink":   ["F26394", "B5135D", "550016"],
    "grape":  ["D06BEA", "9A1CB7", "62007E"],
    "violet": ["D9B9FF", "805CEC", "4805A3"],
    "blue":   ["8DCDFF", "2A72E5", "000E84"],
    "cobalt": ["136EFC", "0009C2", "17008A"],
    "cyan":   ["1BB3CC", "04819C", "002941"],
    "green":  ["75D9B4", "058765", "002E13"],
    "lime":   ["9AD84A", "71B61A", "115A00"],
}
# 시각 보정은 이 스크립트에 넣지 않음 (스크립트 출력 = 시각 보정 전 팔레트)
# 시각 보정 값과 이유는 Figma 디자인 의사결정 노트에 따로 기록함
# 아래 두 항목은 비워 둔 상태로 유지 (값을 넣으면 출력에 반영됨)
HUE_CORRECTION = {}       # {색: {스케일: ±°}}
HUE_CORRECTION_NOTE = {}
HEX_OVERRIDE = {}         # {(모드, 색, 스케일): HEX}
HEX_OVERRIDE_NOTE = {}
# 새 색: 이름 → HEX 하나(키 컬러 자동) 또는 키 컬러 목록
NEW_COLORS = {
    # "teal": "00838F",
}

YELLOW_FAMILY_RANGE = (60.0, 150.0)  # 200 색조가 이 범위면 옐로우 계열

# 최대 채도(050~200)를 정하는 기준 색, 새 색은 여기에 넣지 않음 (넣으면 기존 색 값이 바뀔 수 있음)
BASE_COLORS = ["red", "orange", "yellow", "pink", "grape", "violet", "blue", "cobalt", "cyan", "green", "lime"]
DARK_400_CHROMA_FACTOR = 0.9

# ---------------------------------------------------------------------------
# 색 변환 (sRGB <-> OKLCH)
# ---------------------------------------------------------------------------
def _lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def _gam(c):
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055

def _hex_rgb(h):
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]

def luminance(h):
    r, g, b = [_lin(x) for x in _hex_rgb(h)]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast(a, b):
    ya, yb = luminance(a), luminance(b)
    ya, yb = max(ya, yb), min(ya, yb)
    return (ya + 0.05) / (yb + 0.05)

def hex_to_oklch(h):
    r, g, b = [_lin(x) for x in _hex_rgb(h)]
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return L, math.hypot(a, bb), math.degrees(math.atan2(bb, a)) % 360

def oklch_to_linrgb(L, C, H):
    a = C * math.cos(math.radians(H))
    b = C * math.sin(math.radians(H))
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
            -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
            -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s]

def _in_gamut(rgb):
    return all(-1e-6 <= x <= 1 + 1e-6 for x in rgb)

def gamut_chroma(L, C, H):
    """sRGB 밖이면 L·H를 고정하고, C 이하에서 범위 안에 드는 가장 큰 C를 찾음
    파랑 계열은 범위 안 C 구간이 중간에 끊겨 이분 탐색이 낮은 경계에서 멈추므로 위에서부터 훑음"""
    if _in_gamut(oklch_to_linrgb(L, C, H)):
        return C
    c = C
    while c > 0 and not _in_gamut(oklch_to_linrgb(L, c, H)):
        c -= 0.0001
    if c <= 0:
        return 0.0
    lo, hi = c, min(C, c + 0.0001)
    for _ in range(30):
        mid = (lo + hi) / 2
        if _in_gamut(oklch_to_linrgb(L, mid, H)):
            lo = mid
        else:
            hi = mid
    return lo

def to_hex(rgb):
    """HEX 반올림 (채널별 사사오입)"""
    return "".join("%02X" % round(min(1, max(0, _gam(min(1, max(0, x))))) * 255) for x in rgb)

# ---------------------------------------------------------------------------
# 색조 계산 (Leonardo 기본 색조 + 시각 보정)
# ---------------------------------------------------------------------------
def _interp_lch(a, b, t):
    ha, hb = a[2], b[2]
    if ha is None: ha = hb
    if hb is None: hb = ha
    h = None if ha is None else (ha + (((hb - ha + 180) % 360) - 180) * t) % 360
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, h)

def leonardo_hues(keys):
    """흰색 → 키 컬러(밝은 순) → 검정 경로에서 light 목표 명암비 지점의 색조"""
    nodes = [(1.0, 0.0, None)] + sorted((tuple(hex_to_oklch(k)) for k in keys), key=lambda v: -v[0]) + [(0.0, 0.0, None)]
    n = len(nodes) - 1
    def at(u):
        u = min(max(u, 0.0), 1.0) * n
        i = min(int(u), n - 1)
        return _interp_lch(nodes[i], nodes[i + 1], u - i)
    out = {}
    for s in SCALES:
        yt = (luminance(BG_LIGHT) + 0.05) / TARGET_LIGHT[s] - 0.05
        lo, hi = 0.0, 1.0
        for _ in range(50):
            mid = (lo + hi) / 2
            L, C, H = at(mid)
            r = [min(1, max(0, x)) for x in oklch_to_linrgb(L, C, H or 0.0)]
            if 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2] > yt:
                lo = mid
            else:
                hi = mid
        out[s] = round(at((lo + hi) / 2)[2] % 360, 2)
    return out

def keys_from_hex(hx, base_hue):
    """HEX 하나로 키 컬러 만들기: 500 색조가 가장 가까운 기준 색의 키 컬러를 색조만 돌려서 쓰고,
    명도가 가장 가까운 키는 입력 HEX로 바꿈"""
    h = hex_to_oklch(hx)[2]
    near = min(BASE_COLORS, key=lambda c: abs(((base_hue[c]["500"] - h + 180) % 360) - 180))
    d = ((h - base_hue[near]["500"] + 180) % 360) - 180
    keys = []
    for k in LEONARDO_KEYS[near]:
        L, C, H = hex_to_oklch(k)
        H2 = (H + d) % 360
        keys.append(to_hex(oklch_to_linrgb(L, gamut_chroma(L, C, H2), H2)))
    li = min(range(len(keys)), key=lambda i: abs(hex_to_oklch(keys[i])[0] - hex_to_oklch(hx)[0]))
    keys[li] = hx
    return keys, near

def build_hue():
    """반환: (최종 색조, Leonardo 기본 색조, 새 색 키 컬러·참고한 기준 색)"""
    corr = lambda c, s: HUE_CORRECTION.get(c, {}).get(s, 0.0)
    base = {c: leonardo_hues(LEONARDO_KEYS[c]) for c in BASE_COLORS}
    hue = {c: {s: round((base[c][s] + corr(c, s)) % 360, 2) for s in SCALES} for c in BASE_COLORS}
    new_keys = {}
    for name, v in NEW_COLORS.items():
        keys, near = keys_from_hex(v, hue) if isinstance(v, str) else (list(v), None)
        new_keys[name] = (keys, near)
        base[name] = leonardo_hues(keys)
        hue[name] = {s: round((base[name][s] + corr(name, s)) % 360, 2) for s in SCALES}
    return hue, base, new_keys

def _new_colors_from_argv():
    """--new 이름=HEX 또는 --new 이름=키1,키2,키3 (여러 번 가능) → NEW_COLORS에 추가 (실행할 때만, 파일은 안 바뀜)"""
    args = sys.argv[1:]
    for i, a in enumerate(args):
        if a == "--new" and i + 1 < len(args) and "=" in args[i + 1]:
            name, val = args[i + 1].split("=", 1)
            keys = [v.strip().lstrip("#").upper() for v in val.split(",") if v.strip()]
            if not name or not keys or any(len(k) != 6 for k in keys):
                sys.exit(f"--new 형식 오류: {args[i + 1]} (예: --new teal=00838F 또는 --new teal=9ED8FF,0068F4,001A6E)")
            NEW_COLORS[name.strip().lower()] = keys[0] if len(keys) == 1 else keys

_new_colors_from_argv()
HUE, HUE_BASE, NEW_KEYS = build_hue()

# ---------------------------------------------------------------------------
# 목표 명암비에 맞는 색 찾기
# ---------------------------------------------------------------------------
def solve(target, bg, chroma, hue, darker_than_bg):
    """목표 명암비가 되는 밝기(L)를 찾고, 그 밝기에서 chroma(표현 가능한 최대 이내)를 적용
    반환: (HEX, L, 실제 적용된 C)"""
    yb = luminance(bg)
    yt = (yb + 0.05) / target - 0.05 if darker_than_bg else target * (yb + 0.05) - 0.05
    lo, hi = 0.0, 1.0
    L = 0.5
    for _ in range(60):
        L = (lo + hi) / 2
        c = gamut_chroma(L, chroma, hue)
        r = [min(1, max(0, x)) for x in oklch_to_linrgb(L, c, hue)]
        y = 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2]
        if y < yt:
            lo = L
        else:
            hi = L
    c = gamut_chroma(L, chroma, hue)
    return to_hex(oklch_to_linrgb(L, c, hue)), L, c

EXPRESSIBLE_MAX = 0.6  # 이 값을 넣으면 표현 가능한 최대 채도가 적용됨

def max_chroma(target, bg, hue, darker_than_bg):
    return solve(target, bg, EXPRESSIBLE_MAX, hue, darker_than_bg)[2]

# ---------------------------------------------------------------------------
# 팔레트 계산
# ---------------------------------------------------------------------------
def generate():
    colors = list(HUE)
    yellow_family = [c for c in colors if YELLOW_FAMILY_RANGE[0] <= HUE[c]["200"] <= YELLOW_FAMILY_RANGE[1]]
    base = [c for c in colors if c in BASE_COLORS]
    base_normal = [c for c in base if c not in yellow_family]
    base_yellow = [c for c in base if c in yellow_family]

    # ---- Light ----
    light = {c: {} for c in colors}
    for s in ["050", "100", "200"]:  # 1. 최대 채도
        mx = {c: max_chroma(TARGET_LIGHT[s], BG_LIGHT, HUE[c][s], True) for c in base}
        cap = min(mx[c] for c in base_normal)  # 기준 11색으로만 정함
        cap_y = min(mx[c] for c in base_yellow)
        for c in colors:
            light[c][s] = solve(TARGET_LIGHT[s], BG_LIGHT, cap_y if c in yellow_family else cap, HUE[c][s], True)[0]
    for s in SCALES[4:]:  # 2. 표현 가능한 최대 채도 (100%)
        for c in colors:
            light[c][s] = solve(TARGET_LIGHT[s], BG_LIGHT, EXPRESSIBLE_MAX, HUE[c][s], True)[0]
    for c in colors:  # 3. 300 = 200과 400의 중간 (HEX 확정값 기준)
        mid = (hex_to_oklch(light[c]["200"])[1] + hex_to_oklch(light[c]["400"])[1]) / 2
        light[c]["300"] = solve(TARGET_LIGHT["300"], BG_LIGHT, mid, HUE[c]["300"], True)[0]
    # 4. light HEX 확정 (위 값들이 HEX로 확정됨) + HEX 직접 지정 반영
    for (m, c, s), hx in HEX_OVERRIDE.items():
        if m == "light" and c in light:
            light[c][s] = hx

    # ---- Dark ----
    dark = {c: {} for c in colors}
    for c in colors:  # 5. 400~900: 같은 밝기의 light 채도·색조 (확정된 light HEX 기준)
        curve = sorted([hex_to_oklch(light[c][s]) for s in SCALES], reverse=True)

        def at(L):
            if L >= curve[0][0]:
                return curve[0][1], curve[0][2]
            for (L1, C1, H1), (L2, C2, H2) in zip(curve, curve[1:]):
                if L2 <= L <= L1:
                    t = (L1 - L) / (L1 - L2)
                    d = ((H2 - H1 + 180) % 360) - 180
                    return C1 + (C2 - C1) * t, (H1 + d * t) % 360
            return curve[-1][1], curve[-1][2]


        for s in SCALES[4:]:
            k = DARK_400_CHROMA_FACTOR if s == "400" else 1.0
            yt = TARGET_DARK[s] * (luminance(BG_DARK) + 0.05) - 0.05  # 목표 명암비가 되는 휘도
            lo, hi = 0.0, 1.0
            L = 0.5
            for _ in range(50):  # 반올림 전 색 기준으로 목표 명암비에 맞춤
                L = (lo + hi) / 2
                C, H = at(L)
                r = [min(1, max(0, x)) for x in oklch_to_linrgb(L, gamut_chroma(L, C * k, H), H)]
                if 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2] < yt:
                    lo = L
                else:
                    hi = L
            C, H = at(L)
            dark[c][s] = to_hex(oklch_to_linrgb(L, gamut_chroma(L, C * k, H), H))

    hue_dark = {c: hex_to_oklch(dark[c]["400"])[2] for c in colors}  # dark 050~300 색조 = dark 400 색조
    for s in ["050", "100", "200"]:  # 6. 최대 채도
        mx = {c: max_chroma(TARGET_DARK[s], BG_DARK, hue_dark[c], False) for c in base}
        cap = min(mx[c] for c in base_normal)  # 기준 11색으로만 정함
        cap_y = min(mx[c] for c in base_yellow)
        for c in colors:
            dark[c][s] = solve(TARGET_DARK[s], BG_DARK, cap_y if c in yellow_family else cap, hue_dark[c], False)[0]
    for c in colors:  # 7. 300 = 200과 400의 중간
        mid = (hex_to_oklch(dark[c]["200"])[1] + hex_to_oklch(dark[c]["400"])[1]) / 2
        dark[c]["300"] = solve(TARGET_DARK["300"], BG_DARK, mid, hue_dark[c], False)[0]
    # 8. dark HEX 확정 + HEX 직접 지정 반영
    for (m, c, s), hx in HEX_OVERRIDE.items():
        if m == "dark" and c in dark:
            dark[c][s] = hx

    return {"light": light, "dark": dark, "yellow_family": yellow_family}


# ---------------------------------------------------------------------------
# 검사
# ---------------------------------------------------------------------------
TARGET_TOLERANCE = 0.01                 # 목표 명암비 허용 오차 (±1%), HEX 반올림 때문에 생기는 차이
HUE_GAP_MIN = 5.5                       # 같은 스케일에서 다른 색과 최소 색조 차이
HUE_GAP_EXCEPTIONS = {("blue", "cobalt")}  # 의도적으로 가까운 색 쌍 (경고하지 않음)
# 접근성 기준: (모드, 스케일, 전경, 배경, 최소 명암비, 설명), "self"는 해당 칸 색
A11Y_RULES = [
    ("light", "400", "self", "FFFFFF", 3.0, "보더·아이콘 / 흰 배경"),
    ("light", "400", "self", "F7F7F7", 3.0, "보더·아이콘 / 카드(gray-025)"),
    ("light", "500", "self", "FFFFFF", 4.5, "텍스트 / 흰 배경, fill button 흰 텍스트"),
    ("light", "500", "self", "F7F7F7", 4.5, "텍스트 / 카드(gray-025)"),
    ("dark", "400", "self", "232323", 3.0, "보더 / base(gray-025)"),
    ("dark", "400", "self", "2C2C2C", 3.0, "보더 / popover(gray-050)"),
    ("dark", "400", "FFFFFF", "self", 4.5, "fill button 흰 텍스트"),
    ("dark", "500", "self", "232323", 4.5, "텍스트 / base(gray-025)"),
    ("dark", "500", "self", "2C2C2C", 4.5, "텍스트 / popover(gray-050)"),
]

def _hue_diff(a, b):
    return abs((a - b + 180) % 360 - 180)

# 채도 규칙 검사 허용 오차: HEX 반올림 때문에 생기는 채도 차이
# (스크립트 출력 220칸에서 반올림 차이는 최대 0.0013, 여유를 두고 0.003)
CHROMA_TOLERANCE = 0.003

def _upper_max_chroma(L, C, H, step=0.0005):
    """C 이하에서 sRGB 안에 들어가는 가장 큰 채도
    (색조에 따라 표현 가능한 채도 구간이 둘로 나뉘는 칸이 있어, 위쪽 끝도 '표현 가능한 최대'로 인정)"""
    if _in_gamut(oklch_to_linrgb(L, C, H)):
        return C
    c = C
    while c > 0 and not _in_gamut(oklch_to_linrgb(L, c, H)):
        c -= step
    lo, hi = max(c, 0.0), c + step
    for _ in range(30):
        mid = (lo + hi) / 2
        if _in_gamut(oklch_to_linrgb(L, mid, H)):
            lo = mid
        else:
            hi = mid
    return lo

def chroma_rule(result):
    """채도 규칙의 고정값: 050~200 공통 최대 채도(기준 11색으로 정함), 옐로우 계열 목록"""
    yf = result["yellow_family"]
    base = [c for c in HUE if c in BASE_COLORS]
    normal = [c for c in base if c not in yf]
    yellow = [c for c in base if c in yf]
    caps = {"light": {}, "dark": {}}
    hue_dark = {c: hex_to_oklch(result["dark"][c]["400"])[2] for c in base}
    for s in ["050", "100", "200"]:
        mx = {c: max_chroma(TARGET_LIGHT[s], BG_LIGHT, HUE[c][s], True) for c in base}
        caps["light"][s] = (min(mx[c] for c in normal), min(mx[c] for c in yellow))
        mx = {c: max_chroma(TARGET_DARK[s], BG_DARK, hue_dark[c], False) for c in base}
        caps["dark"][s] = (min(mx[c] for c in normal), min(mx[c] for c in yellow))
    return {"caps": caps, "yellow_family": yf}

def chroma_check(palette, rule):
    """각 칸의 채도가 2~6단계 규칙대로인지 검사, 규칙과 다른 칸 목록 반환
    - light 050~200: 공통 최대 채도 / 400~900: 표현 가능한 최대 / 300: 같은 색 200·400의 중간
    - dark 400~900: 같은 색 light 곡선에서 같은 명도의 채도 (400은 ×0.9) / 050~200: 공통 최대 / 300: 중간
    - 기대 채도는 그 칸 HEX의 명도·색조에서 다시 계산 (색조를 보정해도 채도 규칙은 지켜야 함)"""
    caps, yf = rule["caps"], rule["yellow_family"]
    off = []
    for m in ("light", "dark"):
        for c in palette[m]:
            P = {s: hex_to_oklch(palette[m][c][s]) for s in SCALES}
            if m == "dark":
                curve = sorted([hex_to_oklch(palette["light"][c][s]) for s in SCALES], reverse=True)

                def light_c(L, curve=curve):
                    if L >= curve[0][0]:
                        return curve[0][1]
                    for (L1, C1, _), (L2, C2, _) in zip(curve, curve[1:]):
                        if L2 <= L <= L1:
                            return C1 + (C2 - C1) * (L1 - L) / (L1 - L2)
                    return curve[-1][1]
            for s in SCALES:
                L, C, H = P[s]
                if s in ("050", "100", "200"):
                    want, desc = caps[m][s][1 if c in yf else 0], "공통 최대 채도" + (" (옐로우 계열)" if c in yf else "")
                elif s == "300":
                    want, desc = (P["200"][1] + P["400"][1]) / 2, "200·400 중간 채도"
                elif m == "light":
                    want, desc = EXPRESSIBLE_MAX, "표현 가능한 최대 채도"
                else:
                    k = DARK_400_CHROMA_FACTOR if s == "400" else 1.0
                    want, desc = light_c(L) * k, "light 같은 명도 채도" + (" ×0.9" if s == "400" else "")
                ok_values = {gamut_chroma(L, want, H), _upper_max_chroma(L, want, H)}
                expect = min(ok_values, key=lambda v: abs(v - C))
                if abs(C - expect) > CHROMA_TOLERANCE:
                    off.append(f"{m} {c}-{s}: 채도 {C:.4f} (규칙 {expect:.4f}, {desc})")
    return off

def check(palette, rule):
    """검사 결과를 (항목, 상태 ok/warn/fail, 상세 목록)으로 반환, rule은 chroma_rule() 결과"""
    results = []
    colors = list(palette["light"])

    # 1. 인접 색 간격 (HEX에서 읽은 색조 기준)
    pairs = {}
    for m in ("light", "dark"):
        for s in SCALES:
            h = {c: hex_to_oklch(palette[m][c][s])[2] for c in colors}
            for i, a in enumerate(colors):
                for b in colors[i + 1:]:
                    if (a, b) in HUE_GAP_EXCEPTIONS or (b, a) in HUE_GAP_EXCEPTIONS:
                        continue
                    d = _hue_diff(h[a], h[b])
                    if d < HUE_GAP_MIN:
                        pairs.setdefault((a, b), []).append(f"{m} {s} {d:.1f}°")
    close = [f"{a} · {b}: 색조 차이가 {HUE_GAP_MIN}°보다 작아 비슷해 보일 수 있음 ({', '.join(v)})"
             for (a, b), v in pairs.items()]
    results.append((f"인접 색 간격 {HUE_GAP_MIN}° 이상", "ok" if not close else "warn", close))

    # 2-1. 목표 명암비 ±1% 이내 (반올림 전 색으로 목표를 맞추고 HEX는 한 번만 반올림하므로 HEX 명암비는 조금 다를 수 있음)
    off = []
    for m, target, bg in (("light", TARGET_LIGHT, BG_LIGHT), ("dark", TARGET_DARK, BG_DARK)):
        for c in colors:
            for s in SCALES:
                r = contrast(palette[m][c][s], bg)
                if abs(r / target[s] - 1) > TARGET_TOLERANCE:
                    off.append(f"{m} {c}-{s}: {r:.3f} (목표 {target[s]:.3f})")
    results.append(("목표 명암비 ±1% 이내", "ok" if not off else "fail", off))

    # 2-2. 접근성 기준
    fail = []
    for m, s, fg, bg, need, desc in A11Y_RULES:
        for c in colors:
            hx = palette[m][c][s]
            r = contrast(hx if fg == "self" else fg, hx if bg == "self" else bg)
            if r < need:
                fail.append(f"{m} {c}-{s} ({desc}): {r:.3f} < {need:.3f}")
    results.append(("접근성 기준 (3:1·4.5:1)", "ok" if not fail else "fail", fail))

    # 3. 채도 규칙
    off = chroma_check(palette, rule)
    results.append(("채도 규칙", "ok" if not off else "fail", off))
    return results


ICON = {"ok": "✅", "warn": "⚠️ ", "fail": "❌"}

def print_results(results):
    print("검사 결과")
    for name, state, detail in results:
        print(f"  {ICON[state]} {name}")
        for line in detail:
            print("     - " + line)

def ask(prompt):
    """터미널에서 입력받기, 입력을 받을 수 없으면 None"""
    if not sys.stdin.isatty():
        return None
    try:
        return input(prompt)
    except EOFError:
        return None

def confirm_save(results, path):
    """경고·실패가 있으면 저장할지 묻고, --yes면 묻지 않고 저장"""
    warns = [r for r in results if r[1] == "warn"]
    fails = [r for r in results if r[1] == "fail"]
    if not (warns or fails) or "--yes" in sys.argv:
        return True
    print()
    if warns:
        print("⚠️  색조가 가까운 색이 있음, 화면에서 두 색이 같은 색처럼 보일 수 있음")
        print("   의도한 조합이면 저장해도 됨 (다음부터 경고를 끄려면 HUE_GAP_EXCEPTIONS에 추가)")
    if fails:
        print("❌ 기준을 통과하지 못한 항목이 있음, 저장하면 명암비·채도 규칙이나 접근성 기준에 못 미칠 수 있음")
    ans = ask(f"그래도 {path}로 저장할까요? (y/N): ")
    if ans is None:
        print("입력을 받을 수 없어 저장하지 않음, 저장하려면 --yes를 붙여 실행")
        return False
    return ans.strip().lower() in ("y", "yes")

def save_json(data, path):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"{path} 저장 완료")

def _norm_hex(v):
    v = str(v).strip().lstrip("#").upper()
    return v if len(v) == 6 and all(ch in "0123456789ABCDEF" for ch in v) else None

def apply_corrections(palette, corr):
    """corr = {모드: {색: {스케일: HEX}}} 를 팔레트 복사본에 반영, (보정 팔레트, 바뀐 칸, 오류) 반환"""
    pal = {m: {c: dict(palette[m][c]) for c in palette[m]} for m in ("light", "dark")}
    changed, errors = [], []
    for m, cols in corr.items():
        if m not in pal:
            errors.append(f"모드 '{m}' 없음 (light 또는 dark)")
            continue
        for c, cells in cols.items():
            if c not in pal[m]:
                errors.append(f"{m}: 색 '{c}' 없음")
                continue
            for s, v in cells.items():
                s = str(s).zfill(3)
                hx = _norm_hex(v)
                if s not in SCALES:
                    errors.append(f"{m} {c}: 스케일 '{s}' 없음")
                elif hx is None:
                    errors.append(f"{m} {c}-{s}: HEX '{v}' 형식 오류")
                elif pal[m][c][s] != hx:
                    changed.append((m, c, s, pal[m][c][s], hx))
                    pal[m][c][s] = hx
    return pal, changed, errors

def read_corrections():
    """보정한 칸을 한 줄씩 입력받음, 빈 줄이면 끝"""
    print("보정한 칸을 한 줄에 하나씩 입력 (형식: 모드 색 스케일 HEX, 예: light orange 800 701800)")
    print("다 입력했으면 빈 줄에서 Enter")
    corr = {}
    while True:
        line = ask("> ")
        if line is None or not line.strip():
            return corr
        parts = line.split()
        if len(parts) != 4:
            print("  형식: 모드 색 스케일 HEX (예: dark cobalt 700 4F7BFF)")
            continue
        m, c, s, v = parts
        corr.setdefault(m.lower(), {}).setdefault(c.lower(), {})[s.zfill(3)] = v

def check_corrected(palette, rule, corr):
    """시각 보정한 값을 반영해 7단계 검사를 다시 하고, 통과하면 palette_corrected.json으로 저장"""
    pal, changed, errors = apply_corrections(palette, corr)
    print()
    for e in errors:
        print("  입력 오류: " + e)
    if not changed:
        print("바뀐 칸이 없어 검사하지 않음")
        return
    print(f"시각 보정 반영 칸 ({len(changed)}칸)")
    for m, c, s, old, new in changed:
        target, bg = (TARGET_LIGHT, BG_LIGHT) if m == "light" else (TARGET_DARK, BG_DARK)
        print(f"  {m} {c}-{s}: {old} → {new}  명암비 {contrast(new, bg):.3f} (목표 {target[s]:.3f})"
              f"  채도 {hex_to_oklch(old)[1]:.4f} → {hex_to_oklch(new)[1]:.4f}")
    print()
    results = check(pal, rule)
    print_results(results)
    if any(r[1] == "fail" for r in results if r[0] == "채도 규칙"):
        print("  참고: dark 400~900 채도는 같은 색 light 곡선을 따르므로, light를 보정하면 dark도 함께 맞춰야 할 수 있음")
    if any(r[1] == "fail" for r in results):
        print("❌ 통과하지 못한 항목이 있어 palette_corrected.json을 저장하지 않음 (--yes여도 저장 안 함)")
        print("   실패한 칸을 다시 보정한 뒤 검사하거나, 통과한 칸만 넣어서 다시 검사")
        return
    if confirm_save(results, "palette_corrected.json"):
        save_json(pal, "palette_corrected.json")
    else:
        print("저장하지 않음")


if __name__ == "__main__":
    # 실행: python3 generate_palette.py                → 팔레트 계산·검사, 저장할지 물어본 뒤 시각 보정 검사 여부를 물어봄
    #       python3 generate_palette.py --yes          → 묻지 않고 저장
    #       python3 generate_palette.py --check 보정.json → 보정 값을 반영해 다시 검사
    result = generate()
    rule = chroma_rule(result)
    order = {m: {c: {s: result[m][c][s] for s in SCALES} for c in result[m]} for m in ("light", "dark")}

    if "--check" in sys.argv:
        i = sys.argv.index("--check")
        if i + 1 >= len(sys.argv):
            sys.exit("보정 파일 경로가 필요함: python3 generate_palette.py --check 보정.json")
        with open(sys.argv[i + 1]) as f:
            check_corrected(order, rule, json.load(f))
        sys.exit()

    print("계산 완료 · 옐로우 계열:", result["yellow_family"])
    new = [c for c in HUE if c not in BASE_COLORS]
    if new:
        print("새 색:", new)
        for n in new:
            keys, near = NEW_KEYS[n]
            print(f"  {n}: 키 컬러 {keys}" + (f" ({near} 키 컬러 기반)" if near else ""))
            print("    기본 색조:", " ".join(f"{s}:{HUE_BASE[n][s]:.1f}" for s in SCALES))
    print()
    results = check(order, rule)
    print_results(results)
    if confirm_save(results, "palette.json"):
        save_json(order, "palette.json")
    else:
        print("저장하지 않음")

    ans = ask("\n시각 보정한 값을 검사할까요? (y/N): ")
    if ans is not None and ans.strip().lower() in ("y", "yes"):
        corr = read_corrections()
        check_corrected(order, rule, corr)