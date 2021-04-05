# import the necessary packages
from skimage.metrics import structural_similarity as compare_ssim
import argparse
import imutils
import cv2
import numpy as np
import os

# construct the argument parse and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-f", "--first", required=True,
                help="first input image")
ap.add_argument("-s", "--second", required=True,
                help="second")
ap.add_argument("-o", "--output", required=True,
                help="output")
ap.add_argument("-d", "--outdir", required=True,
                help="outdir")
args = vars(ap.parse_args())

# 加载图像
imageA = cv2.imread(args["first"])
imageB = cv2.imread(args["second"])
# 转为灰度图
grayA = cv2.cvtColor(imageA, cv2.COLOR_BGR2GRAY)
grayB = cv2.cvtColor(imageB, cv2.COLOR_BGR2GRAY)

# 计算两张图片之前的结构相似度指数 Structural Similarity Index (SSIM)
(score, diff) = compare_ssim(grayA, grayB, full=True)
diff = (diff * 255).astype("uint8")
ssim = format(score)


# threshold the difference image, followed by finding contours to
# obtain the regions of the two input images that differ
thresh = cv2.threshold(diff, 0, 255,
                       cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL,
                        cv2.CHAIN_APPROX_SIMPLE)
cnts = imutils.grab_contours(cnts)


# 增加轮廓
for c in cnts:
    # compute the bounding box of the contour and then draw the
    # bounding box on both input images to represent where the two
    # images differ
    (x, y, w, h) = cv2.boundingRect(c)
    cv2.rectangle(imageA, (x, y), (x + w, y + h), (0, 0, 255), 2)
    cv2.rectangle(imageB, (x, y), (x + w, y + h), (0, 0, 255), 2)

# 空图像，用来显示结果
height, width = imageA.shape[0], imageA.shape[1]
imgRes = np.zeros((50, width*2, 3), np.uint8)
cv2.putText(imgRes, "SSIM: "+ssim, (10, 30),
            cv2.FONT_HERSHEY_COMPLEX, 0.8, (0, 150, 0))

# 拼接图像（水平向）
imageStack = np.hstack([imageA, imageB])
imageStack = np.vstack([imageStack, imgRes])

# 创建文件夹
outpath=args["outdir"]
isExist=os.path.exists(outpath)

if not isExist:
    os.mkdir(outpath)


# 保存图像
cv2.imwrite(outpath+args["output"], imageStack)
