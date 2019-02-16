const globalOptions = {
	body: "",
	sticky: false,
	requireInteraction: false
};
const Registry = require(`@api/Registry`);
const Shell = require("@api/Shell");
const AppWindow = require("@api/WindowManager");
const NOTIFICATION_DELAY = 6000; //ms
class Snackbar {
	constructor(options) {
		if (typeof options === "string") options = {message: options};
		let self = this;
		let timeout = options.timeout || (options.message.length > 20 ? options.message.length * 150 : 3000);
		this.ui = document.createElement("snackbar");
		this.ui.style.bottom = module.parent.windowID ? 0 : window.getComputedStyle(Elements.Bar).height;
		this.ui.style.right = CSS.px(0);
		this.ui.style.minWidth = CSS.px(300);
		this.ui.style.maxWidth = CSS.px(450);
		this.ui.style.zIndex = "1010";
		this.ui.message = document.createElement("div");
		this.ui.button = document.createElement("button");
		this.ui.className = "bg-dark text-white very-rounded shadow-lg d-flex position-absolute align-items-center mr-2 mb-2 p-2 fly up show";
		this.ui.message.className = "px-2 lh-18 my-1";
		this.ui.message.innerText = options.message;
		this.ui.append(this.ui.message);
		if (options.buttonText) {
			this.ui.button.className = "btn px-3 border-0 lh-18 font-weight-bolder btn-" + (options.type ? "outline-" + options.type : "white");
			this.ui.button.innerText = options.buttonText;
			this.ui.button.onclick = options.click || console.log;
			this.ui.append(this.ui.button);
		} else this.ui.message.classList.replace("my-1", "py-2");
		if (AppWindow.fromId(module.parent.id))
			AppWindow.fromId(module.parent.id).ui.body.append(this.ui); else
			document.body.appendChild(this.ui);
		setTimeout(() => {
			self.ui.classList.add("hide");
			setTimeout(() => self.ui.remove(), Shell.ui.flyAnimation);
		}, timeout)
	}
}

class Notification {
	constructor(title, options = {}) {
		/* How-to:
		 * title -- title of the notification
		 * options:
		 * * body -- notification body, may be none
		 * * requireInteraction -- indicates if notification will be active until user does something to it, defaults to false
		 * * sticky -- if it is true, notification can't be cleared by user itself, closed automatically when app closes
		 */
		console.log(module);
		let win = AppWindow.fromId(module.parent.id) || null;
		options = Object.assign({}, globalOptions, win ? win.options.notificationOptions || {} : {}, options);
		this.window = win;
		this.options = options;
		if (title === null) return;
		this.ui = document.createElement("notification");
		this.ui.className = (Shell.ui.darkMode ? "bg-dark text-white" : "bg-white") + " toast very-rounded d-block shadow position-relative fly left hide";
		this.ui.header = document.createElement("header");
		this.ui.header.className = "toast-header py-2 border-0 " + (Shell.ui.darkMode ? "text-white" : "");
		this.ui.header.style.background = "rgba(255,255,255,0.2)";
		this.ui.app = document.createElement("strong");
		this.ui.appIcon = document.createElement("icon");
		this.ui.time = document.createElement("small");
		this.ui.body = document.createElement("div");
		this.ui.messageTitle = document.createElement("div");
		this.ui.message = document.createElement("div");
		this.ui.body.className = "toast-body px-0 pt-0 pb-2";
		this.ui.app.className = "mr-auto lh-18 ml-1";
		this.ui.appIcon.className = "mdi mdi-18px lh-18 mr-1 d-flex align-items-center mdi-" + win.options.icon;
		//this.ui.app.style.WebkitBackgroundClip = this.ui.appIcon.style.WebkitBackgroundClip = "text";
		this.ui.app.style.WebkitTextFillColor = this.ui.appIcon.style.WebkitTextFillColor = "transparent";
		this.ui.app.style.background = this.ui.appIcon.style.background = win.options.color + " 50% 50% / 1000px";
		this.ui.app.innerText = win.options.productName;
		this.ui.time.innerText = "just now";
		this.ui.time.className = "text-muted smaller font-weight-bolder";
		this.ui.message.className = "smaller position-relative text-truncate px-3 " + (Shell.ui.darkMode ? "text-light" : "text-muted");
		this.ui.messageTitle.innerText = title;
		this.ui.messageTitle.className = "font-weight-bold px-3";
		if (typeof options.body === "object")
			this.ui.message.append(options.body);
		else this.ui.message.innerHTML = options.body || "";
		if (options.image) {
			this.ui.classList.add("type-image");
			if (Shell.ui.darkMode) this.ui.classList.add("dark");
			this.ui.message.classList.replace("px-3", "mt-2");
			this.ui.body.classList.replace("pb-2", "pb-0")
		}
		this.ui.close = document.createElement("button");
		this.ui.close.className = "close mdi mdi-close ml-2" + (Shell.ui.darkMode ? " text-white" : "");
		this.ui.close.classList.toggle("d-none", options.sticky);
		this.ui.close.onclick = () => this.dismiss();
		this.ui.header.append(this.ui.appIcon, this.ui.app, /*this.ui.time, */this.ui.close);
		this.ui.body.append(this.ui.messageTitle, this.ui.message);
		this.ui.append(this.ui.header, this.ui.body);
		if (options.actions) {
			this.ui.actions = document.createElement('notification-actions');
			this.ui.actions.className = "py-2 px-3 d-flex justify-content-between" + (Shell.ui.darkMode ? " bg-dark" : " bg-light");
			options.actions.forEach(action => {
				let btn = document.createElement("button");
				btn.className = "btn btn-link px-0 mr-2 flex-grow-1";
				btn.style.WebkitTextFillColor = "transparent";
				btn.style.background = win.options.color + " 50% 50% / 1000px";
				btn.style.fontWeight = 600;
				btn.innerText = action.title;
				btn.onclick = action.click;
				this.ui.actions.append(btn);
			});
			this.ui.append(this.ui.actions);
		}

		Elements.MenuBar.notifications.append(this.ui);
		this.trayItem = new TrayItem(win.options.icon);
		this.notify();
	}

	get title() {
		return this.ui.messageTitle.innerText;
	}

	set title(title) {
		this.ui.messageTitle.innerText = title;
	}

	get body() {
		return this.ui.message.innerHTML;
	}

	set body(title) {
		this.ui.message.innerHTML = title;
	}

	get sticky() {
		return !this.ui.close.classList.contains("d-none");
	}

	set sticky(bool) {
		return this.ui.close.classList.toggle("d-none", !bool);
	}

	dismiss() {
		this.ui.classList.replace("show", "hide");
		this.trayItem.remove();
		setTimeout(e => this.ui.remove(), Shell.ui.flyAnimation);
	}

	notify() {
		if (this.window)
			if (this.window.options.notificationsDisabled) return;
		if (window.NOTIFICATIONS_MUTED) return;
		if (!this.options.quiet) {
			let notificationAlert = new Audio(osRoot + "/resources/notification.ogg");
			notificationAlert.volume = Registry.get("system.notificationsVolume") || 1;
			notificationAlert.play();
		}
		let that = this;
		this.ui.classList.replace("hide", "show");
		if (Elements.MenuBar.classList.contains("show")) return;
		Elements.MenuBar.style.bottom = "var(--taskbar-hided)";
		Elements.MenuBar.childNodes.forEach(node => {
			if (!node.classList.contains("d-none") && node.tagName.toLowerCase() !== "notifications")
				node.classList.add("d-none", "notification-showing");
		});
		Elements.MenuBar.notifications.childNodes.forEach((node) => {
			if (node !== this.ui && node !== Elements.MenuBar.notifications.none) node.classList.add("d-none", "notification-showing");
		});
		Elements.MenuBar.classList.replace("fly", "show");
		Elements.BarItems["official/tray"].Container.classList.add("active");

		function stopShowing() {
			Elements.MenuBar.classList.add("fly", "hide");
			Elements.MenuBar.classList.remove("show");
			Elements.BarItems["official/tray"].Container.classList.remove("active");
			setTimeout(e => {
				Elements.MenuBar.style.bottom = "var(--taskbar-height)";
				Elements.MenuBar.notifications.classList.remove("mt-2");
				Elements.MenuBar.querySelectorAll("section").forEach(elem => {
					if (elem.classList.contains("d-none") && elem.classList.contains("notification-showing"))
						elem.classList.remove("d-none", "notification-showing");
				});
				Elements.MenuBar.notifications.childNodes.forEach(node => {
					if (node.classList.contains("d-none") && node.classList.contains("notification-showing"))
						node.classList.remove("d-none", "notification-showing");
				});
			}, Shell.ui.flyAnimation);
			that.ui.removeEventListener("click", stopShowing)
		}

		if (!this.options.requireInteraction)
			setTimeout(stopShowing, NOTIFICATION_DELAY);
		else this.ui.addEventListener("click", stopShowing)
	}
}

module.exports = {Notification, Snackbar};