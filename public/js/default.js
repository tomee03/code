var MD_INLINE_OPTIONS = { headlines: false };

W.DECRYPT = function(hex, key) {
	var index = hex.lastIndexOf('x');
	if (index === -1)
		return;
	var hash = +hex.substring(index + 1);
	var o = hex.substring(0, index);
	if (HASH(o + (key || ''), true) === hash) {
		o = decodeURIComponent(o.replace(/(..)/g, '%$1'));
		var c = o.charAt(0);
		return c === '[' || c === '{' || c === '"' ? PARSE(o) : o;
	}
};

W.ENCRYPT = function(str, key) {
	if (typeof(str) === 'object')
		str = STRINGIFY(str);
	var arr = unescape(encodeURIComponent(str)).split('');
	for (var i = 0; i < arr.length; i++)
		arr[i] = arr[i].charCodeAt(0).toString(16);
	var o = arr.join('');
	return o + 'x' + HASH(o + (key || ''), true);
};

$(W).on('message', function(e) {
	var data = e.originalEvent.data;
	if (data) {
		data = PARSE(data);
		if (data) {
			switch (data.type) {
				case 'windows':
					SETTER('windows/focus', data.id);
					break;
			}
		}
	}
});

ON('resize', function() {
	SETTER('editor', 'resize');
	clipboardresize();
});

function clipboardresize() {
	var el = $('#clipboardbody');
	if (el.length && el[0].parentNode) {
		var parent = el.parent();
		var pw = parent.width();
		el.css('width', pw + SCROLLBARWIDTH());
	}
}

ON('ready', function() {
	$(W).on('resize', function() {
		setTimeout2('resize', function() {
			EMIT('resize');
		}, 100);
	});
	setTimeout(EXEC2('#resize'), 50);
});

var TTIC = ['#1abc9c','#2ecc71','#3498db','#9b59b6','#34495e','#16a085','#2980b9','#8e44ad','#2c3e50','#f1c40f','#e67e22','#e74c3c','#d35400','#c0392b'];

Thelpers.particon = function(type) {
	switch (type) {
		case 'helper':
			return 'fa fa-align-left';
		case 'FUNC':
			return 'fa fa-code';
		case 'REPO':
			return 'fa fa-box';
		case 'config':
			return 'fa fa-cog';
		case 'plugin':
			return 'fa fa-plug';
		case 'route':
			return 'fa fa-link';
		case 'watcher':
			return 'fa fa-eye';
		case 'event':
			return 'fa fa-bolt';

		case 'middleware':
			return 'fa fa-filter';
		case 'htmlcomponent':
			return 'fa fa-code';
		case 'component':
		case 'extension':
			return 'fa fa-drafting-compass';
		case 'schema':
			return 'fa fa-code-branch';
		case 'console':
			return 'fa fa-font';
		case 'operation':
			return 'fa fa-plug';
		default:
			return 'fa fa-tasks';
	}
};

Thelpers.initials = function(value, coloronly) {

	if (value) {
		var index = value.indexOf('.');
		var arr = value.substring(index + 1).replace(/\s{2,}/g, ' ').trim().split(' ');
		var initials = (arr[0].substring(0, 1) + (arr[1] || '').substring(0, 1));
		var sum = 0;

		for (var i = 0; i < value.length; i++)
			sum += value.charCodeAt(i);
	} else {
		sum = 0;
		value = initials = '--';
	}

	return coloronly ? TTIC[sum % value.length] : '<span class="initials" style="background-color:{1}" title="{2}">{0}</span>'.format(initials, TTIC[sum % value.length], value);
};

Thelpers.utc = function(dt) {
	return STRINGIFY(dt).replace(/"/g, '');
};

function hexrgba(hex, alpha){
	var c;
	if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
		c= hex.substring(1).split('');
		if(c.length === 3)
			c= [c[0], c[0], c[1], c[1], c[2], c[2]];
		c= '0x' + c.join('');
		return 'rgba(' + [(c>>16)&255, (c>>8)&255, c&255].join(',') + ',' + alpha + ')';
	}
	return 'rgba(0,0,0,' + alpha + ')';
}

setInterval(function() {
	$('.time').each(function() {
		var time = this.getAttribute('data-time');
		if (time) {
			var dt = new Date(time);
			this.innerHTML = Thelpers.time(dt);
		}
	});
}, 1000 * 30);

Thelpers.filesize = function(value, decimals, type) {
	return value ? value.filesize(decimals, type) : '...';
};

Number.prototype.filesize = function(decimals, type) {

	if (typeof(decimals) === 'string') {
		var tmp = type;
		type = decimals;
		decimals = tmp;
	}

	var value;
	var t = this;

	// this === bytes
	switch (type) {
		case 'bytes':
			value = t;
			break;
		case 'KB':
			value = t / 1024;
			break;
		case 'MB':
			value = filesizehelper(t, 2);
			break;
		case 'GB':
			value = filesizehelper(t, 3);
			break;
		case 'TB':
			value = filesizehelper(t, 4);
			break;
		default:

			type = 'bytes';
			value = t;

			if (value > 1023) {
				value = value / 1024;
				type = 'KB';
			}

			if (value > 1023) {
				value = value / 1024;
				type = 'MB';
			}

			if (value > 1023) {
				value = value / 1024;
				type = 'GB';
			}

			if (value > 1023) {
				value = value / 1024;
				type = 'TB';
			}

			break;
	}

	type = ' ' + type;
	return (decimals === undefined ? value.format(2).replace('.00', '') : value.format(decimals)) + type;
};

function filesizehelper(number, count) {
	while (count--) {
		number = number / 1024;
		if (number.toFixed(3) === '0.000')
			return 0;
	}
	return number;
}

function textarea_autosize(el) {
	el.style.height = '5px';
	var tmp = el.scrollHeight;
	if (tmp < 28)
		tmp = 28;
	el.style.height = tmp + 'px';
	if (tmp !== el.$inputheight) {
		el.$inputheight = tmp;
		var container = $(el.parentNode);
		container.parent().FIND('viewbox', function(com) {
			com.reconfigure({ margin: container.height() + 60 });
		});
	}
}

Thelpers.time2 = function(value) {
	return '<span class="ta-time" data-time="{0}" title="{2}">{1}</span>'.format(value.getTime(), Thelpers.time(value), value.format(null));
};

ON('knockknock', function() {
	$('.ta-time').each(function() {
		var el = $(this);
		el.html(Thelpers.time(new Date(+el.attrd('time'))));
	});
});

Thelpers.markdown = function(value) {
	return value.markdown(MD_INLINE_OPTIONS);
};