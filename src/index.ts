import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import config from "./config.json";

interface IDiffOption {
    path1: string;
    path2: string;
    output: string;
    rate?: number
}

function getRgba(i: number) {
    return [i, i + 1, i + 2, i + 3];
}

function getAverage(...args: number[]) {
    const list = [...args];
    return list.reduce((acc, cur) => {
        acc += cur
        return acc;
    }, 0) / list.length;
}

function diff(params: IDiffOption) {
    const { path1, path2, output, rate } = params;
    const img1 = PNG.sync.read(fs.readFileSync(path1));
    const img2 = PNG.sync.read(fs.readFileSync(path2));

    const threshold = rate || 0.1 * 256;
    const len = img1.data.length;

    return new Promise((rs, rj) => {
        fs.createReadStream(path1)
            .pipe(
                new PNG()
            )
            .on("parsed", function () {

                //   console.log(this.data);
                for (let i = 0; i < len; i += 4) {
                    const [r, g, b, a] = getRgba(i);
                    const item1 = [img1.data[r], img1.data[g], img1.data[b], img1.data[a]]
                    const item2 = [img2.data[r], img2.data[g], img2.data[b], img2.data[a]]
                    const disList = []
                    for (let j = 0; j < item1.length; j++) {
                        const dis = item1[j] - item2[j];
                        disList.push(dis);
                    }
                    const distance = getAverage(...disList)
                    if (distance > threshold) {
                        this.data[r] = 0;
                        this.data[g] = 255;
                        this.data[b] = 0;
                        // this.data[a] = 255;
                    } else {
                        this.data[r] = 0;
                        this.data[g] = 0;
                        this.data[b] = 0;
                        // this.data[a] = 255;
                    }
                }
                this.pack().pipe(fs.createWriteStream(output));
                rs('done');
            });
    })
}

const diffList = config;



async function main() {
    for await (let item of diffList) {
        const { before, after, output } = item;
        diff({
            path1: path.resolve(__dirname, before),
            path2: path.resolve(__dirname, after),
            output: path.resolve(__dirname, output)
        })
    }
}

main();
