st_bg = new Image()
st_bg.src = "./images/stream/bg.png"
st_line = new Image()
st_line.src = "./images/stream/line.png"
st_logo = new Image()
st_logo.src = "./images/stream/logo.png"

function st_get_gray(image)
{
	const canvas2 = document.createElement('canvas')
		canvas2.width = 1366;
		canvas2.height = 768;
	const ctx2 = canvas2.getContext('2d')
	ctx2.drawImage(image, 0, 0, 1366, 768)
	let imgData = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
	let pixels = imgData.data;
	for (var i = 0; i < pixels.length; i += 4) {
		let lightness = 0.2126 * pixels[i] + 0.715 * pixels[i+1] + 0.0722 * pixels[i+2];

		pixels[i] = lightness;
		pixels[i + 1] = lightness;
		pixels[i + 2] = lightness;
	}
	ctx2.putImageData(imgData, 0, 0);
	
	return canvas2;
}

function BG_DataUri(file) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();

		reader.onload = () => {
			resolve(reader.result);
		};

		reader.onerror = reject;

		reader.readAsDataURL(file);
	})
}

function onload2promise(obj){
    return new Promise((resolve, reject) => {
        obj.onload = () => resolve(obj);
        obj.onerror = reject;
    });
}
async function loadImage(src){
    let img = new Image();
    let imgpromise = onload2promise(img);
    img.src = src;
    await imgpromise;
    return img;
}

async function drawGradientText(ctx, text, x, y) 
{
	let mea = ctx.measureText(text)
	// Create gradient
	let gradient = ctx.createLinearGradient(x, 0, x+mea.width, 0);
	gradient.addColorStop(0, "purple");
	gradient.addColorStop(0.5, "blue");
	gradient.addColorStop(1.0, "cyan");
	
	ctx.lineWidth = 4;
	ctx.strokeStyle = gradient;
	ctx.strokeText(text, x, y);
}

function blurify(c) {
	let ctx = c.getContext("2d")
    ctx.globalAlpha = 0.03;

    for (let i = 4; i >= 0; i--) {
        ctx.drawImage(c, i, i, c.width - i, c.height - i, 0, 0, c.width - i, c.height - i);
        ctx.drawImage(c, -i, -i, c.width + i, c.height + i, 0, 0, c.width + i, c.height + i);
		ctx.drawImage(c, -i, i, c.width + i, c.height - i, 0, 0, c.width + i, c.height - i);
		ctx.drawImage(c, i, -i, c.width - i, c.height + i, 0, 0, c.width - i, c.height + i);

		ctx.drawImage(c, i, 0, c.width - i, c.height, 0, 0, c.width - i, c.height);
        ctx.drawImage(c, -i, 0, c.width + i, c.height, 0, 0, c.width + i, c.height);
		ctx.drawImage(c, 0, i, c.width, c.height - i, 0, 0, c.width, c.height - i);
		ctx.drawImage(c, 0, -i, c.width, c.height + i, 0, 0, c.width, c.height + i);
    }
};

async function gen_st()
{
	// Канвас
	let canvas = document.createElement('canvas'),
		ctx = canvas.getContext("2d");
	canvas.width = 1366;
	canvas.height = 768;
	let blur_canvas = document.createElement('canvas'),
		blur_ctx = blur_canvas.getContext("2d");
	blur_canvas.width = 1366;
	blur_canvas.height = 768;


	// Кастомный фон
	let bg
	if (document.getElementById('customstbgcheck').checked) {
		var custombg = document.getElementById('customstbgfile').files[0]
		if (custombg !== undefined) {
			bg = await loadImage(await BG_DataUri(custombg))
		} else {
			return alert("Фон не загружен");
		}
	} else
		bg = st_bg
	
	
	// Весёлые операции
	ctx.save();
	
	ctx.drawImage(st_line, 0, 0, 1366, 768)
	
	ctx.globalCompositeOperation="source-in";
	let gray = st_get_gray(bg)
	ctx.drawImage(gray, 0, 0, 1366, 768)
	
	ctx.globalCompositeOperation="destination-atop";
	ctx.drawImage(bg, 0, 0, 1366, 768)
	
	ctx.restore();
	
	let ch = await loadImage(`./chars/${$('#st_char').val()}.png`)
	ctx.drawImage(ch, 620, 0, 768, 768)
	

	blur_ctx.font = "120px FuturaLightC";
	let mea = blur_ctx.measureText($('#st_name').val())
	let x = Math.max(350-mea.width/2, 10)
	drawGradientText(blur_ctx, $('#st_name').val(), x, 400);
	blur_ctx.font = "100px FuturaLightC";
	mea = blur_ctx.measureText($('#st_date').val())
	let x2 = Math.max(350-mea.width/2, 10)
	drawGradientText(blur_ctx, $('#st_date').val(), x2, 520);
	blur_ctx.font = "100px 'Market Deco [RUS by Daymarius]'";
	mea = blur_ctx.measureText($('#st_streamer').val())
	drawGradientText(blur_ctx, $('#st_streamer').val(), 924-mea.width/2, 686);
	blurify(blur_canvas)

	ctx.drawImage(blur_canvas, 0, 0)

	
	ctx.font = "120px FuturaLightC";
	ctx.fillStyle = "white";
	ctx.fillText($('#st_name').val(), x, 400);
	ctx.font = "100px FuturaLightC";
	ctx.fillText($('#st_date').val(), x2, 520);
	ctx.font = "100px 'Market Deco [RUS by Daymarius]'";
	ctx.fillText($('#st_streamer').val(), 924-mea.width/2, 686);

	ctx.drawImage(st_logo, 0, 0, 1366, 768)
	
	
	
	downloadCanvas(canvas.toDataURL("image/png"), "stream.png")
}