$( document ).ready(function() {

	if ( sessionStorage.SectionsData ) {
 		loadSectionsData();
	} 
	else {
	 	$.get( "http://localhost:3000/getAllSections", function( data ) {
	 		sessionStorage.SectionsData = JSON.stringify(data);
	 		loadSectionsData();
		});
	};

	function loadSectionsData () {
	 	var sections = JSON.parse(sessionStorage.SectionsData)

		$('#autocomplete').autocomplete({
			lookup: sections,
			minChars: 2,
			maxHeight: 150,
			onSelect: function (suggestion) {
				$('#autocomplete').val(suggestion.id);
			},
			formatResult: function (suggestion, currentValue) {
				return suggestion.value + " (" + suggestion.section +")";
			}
		});
	}
});
