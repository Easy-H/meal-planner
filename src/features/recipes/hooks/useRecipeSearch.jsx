import * as Hangul from 'hangul-js';

function isInclude(searchKeyword, v) {

    if (Hangul.search(v, searchKeyword) !== -1) return true;

    const isChoseongQuery =
        searchKeyword.split('').every(
            char => Hangul.isConsonant(char)
                && !Hangul.isVowel(char));

    if (isChoseongQuery) {
        // 제품명에서 초성만 추출 (예: '클린' -> 'ㅋㄹ')
        const choseongName = Hangul.disassemble(v, true).map(group => group[0]).join('');
        if (choseongName.includes(searchKeyword)) return true;
    }

    return false;
}

export function useRecipeSearch(targets, keyword) {
    const searchKeyword = keyword.toLowerCase().trim();

    const funcs = [
        (item) => { return item.name.toLowerCase() },
        (item) => { return item.category.toLowerCase() }
    ]

    let searchResult = targets.filter(item => {

        for (let i = 0; i < funcs.length; i++) {
            const v = funcs[i](item);
            
            if (isInclude(searchKeyword, v)) return true;

        }

        const value = Object.keys(item.ingredients || {}).some((ing) => {
            return isInclude(searchKeyword, ing);
        }
        );

        return value;
    });

    return { searchResult }
}