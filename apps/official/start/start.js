const fs = require("fs").promises;
let button = document.createElement("button");
const Menu = require(`@api/Menu`);
const Shell = require("@api/Shell");
const AppWindow = require("@api/WindowManager");
let menu = new Menu([{
	label: "File Manager",
	icon: "folder-outline",
	click() {
		AppWindow.launch("official/files");
	}
}, {
	label: "Terminal",
	icon: "console-line",
	click() {
		AppWindow.launch("official/terminal");
	}
}, {
	label: "Settings",
	icon: "settings-outline",
	click() {
		Shell.openSettings();
	}
},
	{type: "separator"}, {
	label: "Toggle Developer Tools",
		icon: "developer-board",
	shortLabel: "Dev Tools",
	click: e => {
		require("electron").remote.getCurrentWindow().toggleDevTools();
	}
}, {
	label: "Restart System UI",
		icon: "restart",
	shortLabel: "Reboot",
	click: () => {
		require("electron").remote.getCurrentWindow().reload();
	}
}, {
	label: "Quit AtomOS",
		icon: "exit-to-app",
	shortLabel: "Quit",
	click: () => {
		window.close();
	}
}]);
body.className = "d-flex align-items-center ml-2";
button.className = "btn border-0 rounded-max mdi mdi-36px lh-36 shadow d-flex align-items-center justify-content-center text-white p-0 my-1 mdi-chevron-up";
button.style.background = "linear-gradient(135deg, #283593, #1565c0)";
button.style.height = button.style.width = CSS.px(38);
if (!Shell.isMobile) button.title = "All Apps (<i class='mdi mdi-atom'></i>)";
button.addEventListener("click", e => {
	e.stopPropagation();
	Elements.StartMenu.toggle();
});
button.addEventListener("contextmenu", e => {
	e.stopPropagation();
	menu.popup();
});
button.style.transition = "transform .25s linear";
body.appendChild(button);
if (Shell.isMobile) {
	body.className = "d-flex justify-content-around flex-grow-1";
	let closeButton = document.createElement("button");
	closeButton.className = "mdi mdi-chevron-left mdi-36px btn d-flex align-items-center bg-transparent lh-36 py-1";
	closeButton.onclick = e => {
		e.stopPropagation();
		AppWindow.getFocusedWindow().close();
	};
	body.prepend(closeButton);
	let tasksButton = document.createElement("button");
	tasksButton.className = "mdi mdi-crop-square mdi-36px btn d-flex align-items-center bg-transparent lh-36 py-1";
	tasksButton.onclick = e => TaskManager.toggle();
	body.append(tasksButton);
} else button.classList.add("mr-3");
if (!Shell.isMobile) new Tooltip(button);
window.addEventListener("keydown", e => {
	if (e.key === "Meta") window.__MetaKeyOverriden = false;
});
window.addEventListener("keyup", e => {
	if (e.key === "Meta" && !window.__MetaKeyOverriden) Elements.StartMenu.toggle();
});

fs.readFile(__dirname + "/menu.js", "utf-8").then(code => {
	new Function('body', '__dirname', code)(document.body, __dirname)
});
return button;
