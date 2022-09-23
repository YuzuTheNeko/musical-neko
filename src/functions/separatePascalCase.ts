const UpperRegex = /([A-Z])([a-z]+)/g

export default function(str: string): string {
    const got = str.matchAll(UpperRegex)
    const res = new Array<string>()

    for (const [ word ] of got) {
        res.push(word)
    }

    return res.join(' ')
}