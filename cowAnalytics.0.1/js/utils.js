const URL_DATASET = "../dataset/created_data.csv";
function get_data_set(url){
	return d3.csv(url);
}

function get_dataset_filtered_by_date(dataset,value) {
	return dataset.filter(entry => entry.sample_start_time === value);
}

function get_filter_by_date(url, value) {
	return d3.csv(url, (data) => {
		if (data.date.includes(value)) {
			console.log(data);
			return data;
		}
	});
}

function get_filter_by_id(url, value) {
	return d3.csv(url, (data) => {
		if (data.cowId.includes(value)) {
			console.log(data);
			return data;
		}
	});
}

function format_date_day(date) {
	const dateObj = new Date(date + 'T00:00:00');
	return new Intl.DateTimeFormat('en-US').format(dateObj);
}

function date_to_milliseconds(date) {
	return new Date(date).getTime();
}

function prepare_date(string_date){
	
	const dateString = string_date;
	const dateParts = dateString.split(" ");
	return {
		date : dateParts[0].split("/"),
		time: dateParts[1].split(":")
	}
}

function date_to_ddmmyyyyhhmmss(date) {

	const string_date = prepare_date(date);

	const year = string_date.date[2];
	const month = string_date.date[1].padStart(2, '0'); 
	const day = string_date.date[0].padStart(2, '0');
	const hours = string_date.time[0].padStart(2, '0');
	const minutes = string_date.time[1].padStart(2, '0');

	// Construct the formatted date and time string
	return `${day}/${month}/${year} ${hours}:${minutes}:00`;

}

function date_to_ddmmyyyyhhmm(date) {

	const string_date = prepare_date(date);

	const year = string_date.date[2];
	const month = string_date.date[1].padStart(2, '0'); 
	const day = string_date.date[0].padStart(2, '0');
	const hours = string_date.time[0].padStart(2, '0');
	const minutes = string_date.time[1].padStart(2, '0');

	// Construct the formatted date and time string
	return `${day}/${month}/${year} ${hours}:${minutes}`;

}

function date_to_mmddyyyyhhmm(date) {

	const string_date = prepare_date(date);

	const year = string_date.date[2];
	const month = string_date.date[1].padStart(2, '0'); 
	const day = string_date.date[0].padStart(2, '0');
	const hours = string_date.time[0].padStart(2, '0');
	const minutes = string_date.time[1].padStart(2, '0');

	// Construct the formatted date and time string
	return `${month}/${day}/${year} ${hours}:${minutes}`;

}

function get_hour(date){

	const string_date = prepare_date(date);

	const hours = string_date.time[0].padStart(2, '0');
	const minutes = string_date.time[1].padStart(2, '0');

	// Construct the formatted date and time string
	return `${hours}:${minutes}:00`;
}

function date_to_ddmmyyyy(date){

	const string_date = prepare_date(date);

	const year = string_date.date[2];
	const month = string_date.date[1].padStart(2, '0'); // Ensure zero padding
	const day = string_date.date[0].padStart(2, '0'); // Ensure zero padding for one or two-digit days

	// Construct the formatted date and time string
	return `${day}/${month}/${year}`;
}

function date_to_mmddyyyy(date){
	const string_date = prepare_date(date);

	const year = string_date.date[2];
	const month = string_date.date[1].padStart(2, '0'); // Ensure zero padding
	const day = string_date.date[0].padStart(2, '0'); // Ensure zero padding for one or two-digit days

	// Construct the formatted date and time string
	return `${month}/${day}/${year}`;
}


function date_to_yy_mm_dd(date){

	const string_date = prepare_date(date);

	const year = string_date.date[2];
	const month = string_date.date[0].padStart(2, '0'); // Ensure zero padding
	const day = string_date.date[1].padStart(2, '0'); // Ensure zero padding for one or two-digit days

	// Construct the formatted date and time string
	return `${year}-${month}-${day}`;
}

function startCalendar(){
	// Get the reference to the input element
	document.getElementById('datePicker').valueAsDate = new Date();
}