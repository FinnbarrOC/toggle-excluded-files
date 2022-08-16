// Credits to https://github.com/Oliver-Akins/file-hider

export function changePathVisibility(path: string, hide: boolean) {
	let n = document.querySelector(`[data-path="${path}"]`);
	if (!n) {
		return;
	}
	let p = n.parentElement
	if (p != null) {
		if (hide) {
			p.style.display = `none`
		} else {
			p.style.display = ``;
		}
	}
}
