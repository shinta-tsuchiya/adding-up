'use strict';
const fs = require('fs'); // Node.jsのモジュールとなるオブジェクトの呼びだし
// fs FileSystemの略。ファイルを扱うためのモジュール。

const readline = require('readline'); // Node.jsのモジュールとなるオブジェクトの呼び出し
// readline ファイルを一行ずつ読み込むためのモジュール

const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ input: rs, output: {} });
/* popu-pref.csv ファイルから、ファイルの読み込みを行う Stream を生成し、
それを readline オブジェクトのinputとして設定し、 rl オブジェクトを作成 */

const prefectureDataMap = new Map(); // Key: 都道府県 value: 集計データのオブジェクト
/* 集計されたデータを格納する連想配列です。
添字となるキー (key) と値 (value) が何であるのかは、コードだけからは読み取りにくいため、
コメントに書いておきます。 */

/* rl オブジェクトで line というイベントが発生したらこの無名関数を呼んで下さい */
rl.on('line', lineString => {
    const columns = lineString.split(',');
/* この行は、引数 lineString で与えられた文字列をカンマ , で分割して、
それを columns という名前の配列にしています。
たとえば、"ab,cde,f" という文字列であれば、["ab", "cde", "f"]という文字列からなる配列に分割されます。
今回扱うファイルは各行が 集計年,都道府県名,10〜14歳の人口,15〜19歳の人口 という形式になっているので、
これをカンマ , で分割すると ["集計年","都道府県名","10〜14歳の人口","15〜19歳の人口"] といった配列になります。 */

    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    /* 上記では配列 columns の要素へ並び順の番号でアクセスして、
    集計年（0 番目）,都道府県（1 番目）,15〜19 歳の人口（3 番目）をそれぞれ変数に保存しています。
    人口の部分だけ parseInt() （パースイント）という関数が使われています。これは文字列を整数値に変換する関数です。
    そもそも lineString.split() は、文字列を対象とした関数なので、結果も文字列の配列になっています。
    しかし、集計年や 15〜19 歳の人口はもともと数値なので、文字列のままだと数値と比較したときなどに不都合が生じます。
    そこで、これらの変数を文字列から数値へ変換するために、parseInt() を使っているのです。 */

    /* 集計年の数値 year が、 2010 または 2015 である時を if 文で判定しています。
    2010 年または 2015 年のデータのみが、コンソールに出力されます。 */

    if (year === 2010 || year === 2015) {

        let value = prefectureDataMap.get(prefecture);
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
/* このコードは連想配列 prefectureDataMap からデータを取得しています。
value の値が Falsy の場合に、value に初期値となるオブジェクトを代入します。
その県のデータを処理するのが初めてであれば、value の値は undefined になるので、この条件を満たし、
value に値が代入されます。
オブジェクトのプロパティ popu10 が 2010 年の人口、 popu15 が 2015 年の人口、 change が
人口の変化率を表すプロパティです。
変化率には、初期値では null を代入しておきます。 */

        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
/* ここで、人口のデータを連想配列に保存しています。
連想配列へ格納したので、次から同じ県のデータが来れば
let value = prefectureDataMap.get(prefecture);
のところでは、保存したオブジェクトが取得されることになります。 */

    }
});

/* 'close' イベントは、全ての行を読み込み終わった際に呼び出されます。
その際の処理として、各県各年男女のデータが集計された Map のオブジェクトを出力しています。 */
rl.on('close', () => {
    for (let [key, value] of prefectureDataMap) {
      value.change = value.popu15 / value.popu10;
    }
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
      return pair2[1].change - pair1[1].change;
    });
    const rankingStrings = rankingArray.map(([key, value]) => {
      return (
        key +
        ': ' +
        value.popu10 +
        '=>' +
        value.popu15 +
        ' 変化率:' +
        value.change
      );
    });
    console.log(rankingStrings);
  });

