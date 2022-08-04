import iterate from "dbdts.db/dist/functions/iterate"

const UpperRegex = /([A-Z])([a-z]+)/g

export default function(str: string): string {
    const got = str.matchAll(UpperRegex)
    const res = new Array<string>()

    iterate(got, ([ word ]) => res.push(word))

    return res.join(' ')
}