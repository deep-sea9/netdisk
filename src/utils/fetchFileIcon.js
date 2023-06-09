import path from 'path'

const dic = [
	{
		ext: ['AI'],
		icon: require(`@/assets/images/filetype_icon/ai.png`),
	},
	{
		ext: ['DOC', 'DOCX'],
		icon: require(`@/assets/images/filetype_icon/doc.png`),
	},
	{
		ext: ['XLS', 'XLSX'],
		icon: require(`@/assets/images/filetype_icon/xls.png`),
	},
	{
		ext: ['EXE', 'CMD', 'APK', 'DMG'],
		icon: require(`@/assets/images/filetype_icon/exe.png`),
	},
	{
		ext: ['HTML', 'XML', 'HTM', 'CSS', 'JS', 'VUE', 'JAVA'],
		icon: require(`@/assets/images/filetype_icon/html.png`),
	},
	{
		ext: ['WAV', 'OGG', 'M4R', 'M4A', 'WMA', 'FLAC', 'MP3', 'AAC', 'AMR'],
		icon: require(`@/assets/images/filetype_icon/MP3.png`),
	},
	{
		ext: ['PNG', 'JPG', 'ICO', 'JPEG', 'GIF', 'WEBP', 'BMP', 'TIFF'],
		icon: require(`@/assets/images/filetype_icon/image.png`),
	},
	{
		ext: ['MP4', 'MOV'],
		icon: require(`@/assets/images/filetype_icon/video.png`),
	},
	{
		ext: ['TTF', 'OTF', 'WOFF', 'WOFF2'],
		icon: require(`@/assets/images/filetype_icon/ttf.png`),
	},
	{
		ext: ['TXT', 'MD'],
		icon: require(`@/assets/images/filetype_icon/txt.png`),
	},
	{
		ext: ['PDF'],
		icon: require(`@/assets/images/filetype_icon/pdf.png`),
	},
	{
		ext: ['PPT', 'PPTX'],
		icon: require(`@/assets/images/filetype_icon/ppt.png`),
	},
	{
		ext: ['PSD'],
		icon: require(`@/assets/images/filetype_icon/psd.png`),
	},
	{
		ext: ['ZIP', 'RAR', '7Z'],
		icon: require(`@/assets/images/filetype_icon/zip.png`),
	},
]

function fetchFileIcon(type, name, tableKind) {
	if(tableKind === '文件夹') {
		return require(`@/assets/images/filetype_icon/folder.png`)
	}else {
		let ext;
		if(type) {
			ext = type
		}else {
			ext = path.extname(name).split('.')[1]
		}
		if (!ext) {
			return require(`@/assets/images/filetype_icon/folder.png`)
		} else {
			ext = ext.toUpperCase()
			for (let value of dic) {
				const flag = value.ext.includes(ext)
				if (flag) {
					return value.icon
				}
			}
			return require(`@/assets/images/filetype_icon/default.png`)
		}
	}
}

export default fetchFileIcon
