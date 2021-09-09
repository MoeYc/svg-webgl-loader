import svgLoader from './index';

import svgUrl from '../public/static/svg/tiger.svg';

svgLoader({svgUrl, config:{
	needTrim: true,
	needFill: true,
	needStroke: true
}}).then((canvas) => {
	const dataURL = canvas.toDataURL();
	const imgDom = document.createElement('img');
	imgDom.src = dataURL;
	const root = document.getElementById('root');
	root.appendChild(imgDom);
});

