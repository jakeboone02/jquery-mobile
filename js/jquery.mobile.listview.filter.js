//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Adds a filtering textfield to listviews
//>>label: Listview Filter

define( [ "jquery", "./jquery.mobile.listview", "./jquery.mobile.forms.textinput" ], function( $ ) {
//>>excludeEnd("jqmBuildExclude");
(function( $, undefined ) {

$.mobile.listview.prototype.options.filter = false;
$.mobile.listview.prototype.options.filterPlaceholder = "Filter items...";
$.mobile.listview.prototype.options.filterTheme = "c";
$.mobile.listview.prototype.options.filterCallback = function( text, searchValue ){
	return text.toLowerCase().indexOf( searchValue ) === -1;
};

$( document ).delegate( ":jqmData(role='listview')", "listviewcreate", function() {

	var list = $( this ),
		listview = list.data( "listview" ),
		filterIndex = [],
		dividerIndex = {},
		listIsDynamic = list.jqmData( "dynamic" ) == true;

	if ( !listview.options.filter ) {
		return;
	}

	// Cache the filter text if the list is not dynamic
	if ( !listIsDynamic ) {

		list.children().each(function(i, v) {

			var item = $( this );

			if ( item.is( "li:jqmData(role=list-divider)" ) ) {

				dividerIndex[ i ] = true;
			} else {

				filterIndex[ i ] = item.jqmData( "filtertext" ) || item.text();
			}
		});
	}

	var wrapper = $( "<form>", {
			"class": "ui-listview-filter ui-bar-" + listview.options.filterTheme,
			"role": "search"
		}),
		search = $( "<input>", {
			placeholder: listview.options.filterPlaceholder
		})
		.attr( "data-" + $.mobile.ns + "type", "search" )
		.jqmData( "lastval", "" )
		.bind( "keyup change", function() {

			var $this = $(this),
				val = this.value.toLowerCase(),
				listItems = null,
				lastval = $this.jqmData( "lastval" ) + "",
				childItems = false,
				itemtext = "",
				item,
				hideQueue = [];

			// Change val as lastval for next execution
			$this.jqmData( "lastval" , val );
			if ( !listIsDynamic || val.length < lastval.length || val.indexOf(lastval) !== 0 ) {

				// Check all items if the list is not dynamic or if the user removed
				// characters or pasted something totally different
				listItems = list.children();
			} else {
            
				// Only chars added, not removed, only use visible subset
				listItems = list.children( ":not(.ui-screen-hidden)" );
			}

			if ( val ) {

				// This handles hiding regular rows without the text we search for
				// and any list dividers without regular rows shown under it.  If
				// the list is not dynamic, we can search the cached filter values
				// instead of accessing the DOM elements.

				if ( !listIsDynamic ) {

					for ( var i = filterIndex.length - 1; i >= 0; i-- ) {

						if ( dividerIndex[ i ] ) {

							if ( !childItems ) {

								hideQueue.push( i );
							}

							childItems = false;
						} else if ( listview.options.filterCallback( filterIndex[ i ], val ) ) {

							hideQueue.push( i );
						} else {

							childItems = true;
						}
					}

					for ( var h = 0, hl = hideQueue.length; h < hl; h++ ) {

						listItems.eq( hideQueue[ h ] ).toggleClass( "ui-filter-hidequeue", true );
					}
				} else {

					for ( var i = listItems.length - 1; i >= 0; i-- ) {
						item = $( listItems[ i ] );
						itemtext = item.jqmData( "filtertext" ) || item.text();

						if ( item.is( "li:jqmData(role=list-divider)" ) ) {

							item.toggleClass( "ui-filter-hidequeue" , !childItems );

							// New bucket!
							childItems = false;

						} else if ( listview.options.filterCallback( itemtext, val ) ) {

							//mark to be hidden
							item.toggleClass( "ui-filter-hidequeue" , true );
						} else {

							// There's a shown item in the bucket
							childItems = true;
						}
					}
				}

				// Show items, not marked to be hidden
				listItems
					.filter( ":not(.ui-filter-hidequeue)" )
					.toggleClass( "ui-screen-hidden", false );

				// Hide items, marked to be hidden
				listItems
					.filter( ".ui-filter-hidequeue" )
					.toggleClass( "ui-screen-hidden", true )
					.toggleClass( "ui-filter-hidequeue", false );

				hideQueue = [];

			} else {

				//filtervalue is empty => show all
				listItems.toggleClass( "ui-screen-hidden", false );
			}
			listview._refreshCorners();
		})
		.appendTo( wrapper )
		.textinput();

	if ( $( this ).jqmData( "inset" ) ) {
		wrapper.addClass( "ui-listview-filter-inset" );
	}

	wrapper.bind( "submit", function() {
		return false;
	})
	.insertBefore( list );
});

})( jQuery );
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd("jqmBuildExclude");
