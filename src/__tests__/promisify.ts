import { createCanvas, loadImage } from "canvas"
import { writeFileSync } from "fs"
import { Module } from "module"

async function main() {
    const canvas = createCanvas(1200, 600)
    const user1 = await loadImage('https://cdn.discordapp.com/avatars/620734023328595979/9b49ff66047931b94f9d16a30b65d0c1.png?size=1024')
    const user2 = await loadImage('https://cdn.discordapp.com/avatars/834647548320415797/fafa5fd84b1329238e6aa8c98870d60b.png?size=1024')
    const heart = await loadImage('https://cdn.discordapp.com/emojis/994284915657031860.png?size=2048&quality=lossless')
    const background = await loadImage('https://cdn.discordapp.com/attachments/908440011333058604/1025779020572409916/unknown.png')
    const border = await loadImage('https://cdn.discordapp.com/attachments/908440011333058604/1025783184383811686/unknown.png')
    const loveBorder = await loadImage('https://cdn.discordapp.com/attachments/908440011333058604/1025786685511962664/ezgif.com-gif-maker.png')

    const ctx = canvas.getContext('2d')

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
    ctx.drawImage(border, 0, 0, canvas.width, canvas.height)
    
    ctx.save()

    ctx.beginPath();
    ctx.arc(300, 300, 200, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(user1, 100, 100, 400, 400)
    
    ctx.restore()

    ctx.save()

    ctx.beginPath()
    ctx.arc(900, 300, 200, 0, 2 * Math.PI);
    ctx.clip()
    ctx.drawImage(user2, 700, 100, 400, 400)

    ctx.restore()
    ctx.drawImage(loveBorder, 50, 50, 500, 500)
    ctx.drawImage(loveBorder, 650, 50, 500, 500)

    ctx.drawImage(heart, 475, 175, 250, 250)
}

main()

const d: any = {}

async function createShipImage(user1url: any, user2url: any, heartUrl = 'https://cdn.discordapp.com/emojis/994284915657031860.png?size=2048&quality=lossless', hideLoveBorder = false) {
console.log(1)
    const canvas = createCanvas(1200, 600)
    const user1 = await loadImage(user1url.replace('webp', 'png'))
    const user2 = await loadImage(user2url.replace('webp', 'png'))
    const heart = await loadImage(heartUrl )
    const background = await loadImage('https://cdn.discordapp.com/attachments/908440011333058604/1025779020572409916/unknown.png')
    const border = await loadImage('https://cdn.discordapp.com/attachments/908440011333058604/1025783184383811686/unknown.png')
    const loveBorder = hideLoveBorder ? null : await loadImage('https://cdn.discordapp.com/attachments/908440011333058604/1025786685511962664/ezgif.com-gif-maker.png')
 
console.log(2)
    const ctx = canvas.getContext('2d')
 
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
    ctx.drawImage(border, 0, 0, canvas.width, canvas.height)
 
    ctx.save()
 
    ctx.beginPath();
    ctx.arc(300, 300, 200, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(user1, 100, 100, 400, 400)
 
    ctx.restore()
 
    ctx.save()
console.log(3)
 
    ctx.beginPath()
    ctx.arc(900, 300, 200, 0, 2 * Math.PI);
    ctx.clip()
    ctx.drawImage(user2, 700, 100, 400, 400)
 
    ctx.restore()
    if (loveBorder) {
        ctx.drawImage(loveBorder, 50, 50, 500, 500)
        ctx.drawImage(loveBorder, 650, 50, 500, 500)
    }
 
console.log(4)
    ctx.drawImage(heart, 475, 175, 250, 250)
return canvas
}