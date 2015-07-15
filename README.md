# _dsDataTable plug-in for jQuery

_dsDataTable is a plug-in for jQuery based on bootstrap css and working with AJAX requests. In order to, with some configurations create a PivotTable with AJAX requests.

## Having support

* Search, configuration:
  * Enable or disable
  * Text placeholder
  * Text button
  * Autosearch enable or disable
  * Additional classes
  
* Records per page, Configuration:
  * Enable or disable
  * Number of records
  * Next option in select
  * Amount of options in select
  * Additional classes
  
* Totals label, Configuration:
  * Enable or disable
  * Display text
  * Loading text
  * Filter text
  * Additional classes
  
* Pagination, Configuration:
  * Enable or disable
  * Additional classes
  
* Ordering standard, Configuration:
  * column name and order "ASC or DESC"
  
* Sort column by clicking the th element.

## Installation
The installation is to add styles, bootstrap and dsDataTable, add the javascripts, jQuery and dsDatatable.
The plugin was developed based on versions of jQuery-2.1.4 and Bootstrap-3.3.5.

**Style CSS**
```html
<link rel="stylesheet" href="lib/bootstrap-3.3.5/css/bootstrap.min.css">
<link rel="stylesheet" href="style-dsDataTable.css">
```

**Scripts JavaScript**
```html
<script src="lib/jquery-2.1.4.js" type="text/javascript"></script>
<script src="dsDataTable.js" type="text/javascript"></script>
```

## Simple application

**HTML**
```html
<table class="table table-bordered table-hover" id="exemple">
    <thead>
        <tr>
            <th>Name</th>
            <th>Surname</th>
            <th>Date of birth</th>
            <th>Department</th>
            <th>E-mail</th>
            <th>Salary</th>
        </tr>
    </thead>
</table>
```

**JavaScript**
```javascript
$('#exemple').dsDataTable({
    columns: [
        {name: "name", class: 'class_name'},
        {name: "surname"},
        {name: "date_birth", order: false},
        {name: "department"},
        {name: "email"},
        {name: "salary"}
    ],
    ajax: {
        url: 'ajax.php',
        type: 'POST'
    }
});
```

## Default settings

```javascript
search: {
   active: true,
   placeholder: 'Search',
   button: '<span class="glyphicon glyphicon-search" aria-hidden="true"></span>',
   autosearch: true,
   class: ''
},
recordsPage: {
   active: true,
   rows: 10,
   next: 20,
   length: 5,
   class: ''
},
labelTotal: {
   active: true,
   showing: 'Showing',
   to: 'to',
   of: 'of',
   entries: 'entries',
   loading: 'Loading...',
   filter: 'Filter',
   values_in_total: 'values in total',
   records_not_found: 'Records not found.',
   class: ''
},
pagination: {
   active: true,
   class: ''
},
orderDefault: []
```

## All settings 

```javascript
$('#table').dsDataTable({
    search: {
         active: true||false,
         placeholder: '*********',
         button: '*********',
         autosearch: true||false,
         class: 'yourClass'
   },
   recordsPage: {
        active: true||false,
        rows: *,
        next: *,
        length: *,
        class: 'yourClass'
    },
    labelTotal: {
        active: true||false,
        showing: '*********',
        to: '**',
        of: '**',
        entries: '*********',
        loading: '*********',
        filter:  '*********',
        values_in_total: '*********',
        records_not_found: '*********',
        class: 'yourClass'
    },
    pagination: {
        active: true||false,
        class: 'yourClass'
    },
    orderDefault: [
        {name: 'Column_name', order: 'ASC||DESC'},
        .... 
        ...
    ],
    // ==== required ====
    columns: [
        // Is required you set your columns as the html order.
        {name: 'Column_name', class: 'yourClass', order: true||false }
        ....
        ...
    ],
    // ==== required ====
    ajax: {
        url: '*********',
        type: 'POST||GET|| ...',
        addData: {yourData: 'yourValue'} // ==== optional ====
    }
});
```

## Back-End

* Get
```php
/* 
* ====== Example in PHP. ======
* === Sample file ajax.php. ===
*
* ['dsRecordPages']    => Amounts of records per page.
* ['dsSearch']         => String to input search.
* ['dsPageNow']        => Current page.
* ['dsOrder']          => Order of the columns = ['dsOrder'][*] = array("name" => "nameColumn", "order" => "ASC||DESC").
*/
```

* Returns
```php
/* 
* ====== Example in PHP. ======
* === Sample file ajax.php. ===
* 
* $return['total_rows']  => Total table rows.
* $return['rows']        => Total table rows - query.
* $return['pages']       => Full table pages = ceil($total_rows_query / $_POST['dsRecordPages']).
* $return['fields'][]    => Associated fields ex.['name'] => 'Rafael', ['surname'] => 'Pegorari'. 
* ****** Name and surname fields must be set in. ******
* .dsDataTable({
*              columns: [
*                  {name: "name"},
*                  {name: "surname"}
*             ],
* *****************************************************
* $return['start']       => Start to limit.
* $return['end']         => End to limit = $start_from + mysql_num_rows($sql).
*/
```
