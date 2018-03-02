console.info('Options is loaded');

var blockList = new BlockList(); // TODO: Not used anywhere

var urlList = [];
var daytimeList = [];

// Saves options to browser.storage.sync
function save_options() {
	var strUrls = document.getElementById('urlList').value;

	var intervals = [];
	$('.interval').each(function () {
		// create interval object
		var interval = {
			from : $(this).find('.from').val(),
			to : $(this).find('.to').val()
		};
		intervals.push(interval);
	});

	// create an array of urls from the str
	urlList = parseUrls(strUrls);

	// option items
	items = {
		urlList: urlList,
		daytimeList: intervals
	};


	browser.storage.local.set(items);

	// Update status to let user know options were saved.
	var status = document.getElementById('status');
	status.textContent = 'Options saved.';
	setTimeout(function () {
		status.textContent = '';
	}, 1500);

	// update bg options via message
	browser.runtime.sendMessage({topic: "update options", options: items});
	// log the bg console
	browser.runtime.sendMessage({topic: "console log", log: "options saved"});
}

// Restores select box and checkbox state using the preferences
// stored in browser.storage.sync
function handleDomLoaded() {
	// start listening the save button
	document.getElementById('save').addEventListener('click', save_options);

	browser.storage.local.get({
		urlList: urlList,
		daytimeList: daytimeList
	}, function (items) {
		// control the undefined case
		if (!items) return;

		var strUrls = updateUrls(items.urlList);
		updateDaytime(items.daytimeList);

		document.getElementById('urlList').value = strUrls;
		// update the bg options
		browser.runtime.sendMessage({topic: "update options", options: items});

	});
	// log the bg console
	browser.runtime.sendMessage({topic: "console log", log: "options loaded"});
}

// parses the str into array of urls
// returns list of urls
function parseUrls(strUrls) {
	newUrlList = strUrls.split("\n");

	for (var i = 0; i < newUrlList.length; i++) {
		// strip the string
		newUrlList[i] = newUrlList[i].replace(/^\s+|\s+$/g, '');
		// if empty then remove
		if (newUrlList[i].length <= 0) {
			// removes it from the list
			newUrlList.splice(i, 1);
		}
	}
	return newUrlList;
}

function parseDaytime(strDaytime) {
	// TODO: Make it safer
	var intervalList = strDaytime.split(",");

	for (var i = 0; i < intervalList.length; i++) {
		strInterval = intervalList[i];
		timeList = strInterval.split("-");

		begin = parseHour(timeList[0]);
		end = parseHour(timeList[1]);

		if (!begin || !end) {
			// clear assign
			begin = {hour: 0, minute: 0};
			end = {hour: 0, minute: 0};
		}

		// create an interval object
		var interval = {
			begin: begin,
			end: end
		};

		intervalList[i] = interval;
	}

	return intervalList;
}

function parseHour(strTime) {

	// strip the string
	strTime = strTime.replace(/^\s*|\s*$/g, '');

	if (strTime.length < 3 || strTime.length > 4) {
		// log the bg console
		browser.runtime.sendMessage({topic: "console log", log: "Inappropriate time: " + strTime});
		return false;
	}

	var strHour;
	var strMinute;

	if (strTime.length == 3) {
		strHour = strTime.substr(0, 1);
		strMinute = strTime.substr(1, 2);
	} else {
		strHour = strTime.substr(0, 2);
		strMinute = strTime.substr(2, 2);
	}

	var time = {
		hour: parseInt(strHour),
		minute: parseInt(strMinute)
	};

	browser.runtime.sendMessage({topic: "console log", log: "time: " + time.hour + "." + time.minute});

	return time;
}

// update the urlList, inform background script
// Returns the list of urls as str: strUrls
function updateUrls(newUrlList) {
	if (!newUrlList) return "";

	urlList = newUrlList;

	// add to str one by one
	var strUrls = "";
	for (var i = 0; i < urlList.length; i++) {
		strUrls = strUrls + urlList[i] + "\n";
	}

	return strUrls;
}

// update the daytimeList, inform background script
// Returns the list of daytime intervals as str
function updateDaytime(newDaytimeList) {
	console.log('loaded intervals',newDaytimeList);
	if (!newDaytimeList) return "";

	$(newDaytimeList).each(function (index) {
		if(index == 0) {
			var dIntervalClone = $('.interval-first');

			dIntervalClone.find('.from').val(this.from);
			dIntervalClone.find('.to').val(this.to);

		}else {
			add_daytime_interval(null,this.from, this.to);
		}
	});
}

// Behaviour of the Add button in Daytime options
function add_daytime_interval(jquery,from, to) {
	var dIntervalClone = $('.interval-first').clone();

	dIntervalClone
		.addClass('interval')
		.removeClass('interval-first')
		.find('.btn-add-interval')
		.text('Remove')
		.removeClass('btn-add-interval')
		.addClass('btn-remove-interval')
		.on('click',remove_daytime_interval);

	if(from !== undefined && to !== undefined){
		dIntervalClone.find('.from').val(from);
		dIntervalClone.find('.to').val(to);
	}

	$('.intervals').append(dIntervalClone);

}

// Behaviour of the Remove button in Daytime options
function remove_daytime_interval() {
	$(this).parent().parent().remove();
}







// Event for the Add button in Daytime options
$('.btn-add-interval').on('click',add_daytime_interval);

document.addEventListener('DOMContentLoaded', handleDomLoaded);
