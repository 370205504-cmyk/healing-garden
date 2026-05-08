#!/usr/bin/env python3
"""
生成占位纹理图片
"""
from PIL import Image, ImageDraw
import os

# 创建 textures 目录
textures_dir = os.path.join(os.path.dirname(__file__), 'assets', 'textures')
os.makedirs(textures_dir, exist_ok=True)

# 1. 植物占位图 - 绿色方块
plant_img = Image.new('RGB', (128, 128), color=(100, 200, 100))
draw = ImageDraw.Draw(plant_img)
draw.rectangle([10, 10, 118, 118], outline=(50, 150, 50), width=3)
plant_path = os.path.join(textures_dir, 'plant_placeholder.png')
plant_img.save(plant_path)
print(f'生成: {plant_path}')

# 2. UI占位图 - 蓝色方块
ui_img = Image.new('RGB', (256, 64), color=(70, 130, 180))
draw = ImageDraw.Draw(ui_img)
draw.rectangle([5, 5, 251, 59], outline=(30, 100, 150), width=2)
draw.text((20, 20), 'UI Placeholder', fill=(255, 255, 255))
ui_path = os.path.join(textures_dir, 'ui_placeholder.png')
ui_img.save(ui_path)
print(f'生成: {ui_path}')

# 3. 背景图 - 浅色背景
bg_img = Image.new('RGB', (720, 1280), color=(240, 245, 240))
draw = ImageDraw.Draw(bg_img)
# 添加简单网格
for i in range(0, 720, 80):
    draw.line([(i, 0), (i, 1280)], fill=(220, 230, 220), width=1)
for j in range(0, 1280, 80):
    draw.line([(0, j), (720, j)], fill=(220, 230, 220), width=1)
bg_path = os.path.join(textures_dir, 'background.png')
bg_img.save(bg_path)
print(f'生成: {bg_path}')

# 4. 按钮图标
btn_img = Image.new('RGB', (64, 64), color=(90, 160, 90))
draw = ImageDraw.Draw(btn_img)
draw.ellipse([5, 5, 59, 59], outline=(60, 130, 60), width=3)
draw.text((20, 25), 'Btn', fill=(255, 255, 255))
btn_path = os.path.join(textures_dir, 'button_icon.png')
btn_img.save(btn_path)
print(f'生成: {btn_path}')

print('所有占位纹理生成完成！')