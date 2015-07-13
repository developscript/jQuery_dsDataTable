<?php

$server = 'localhost';
$user = 'root';
$password = '';
$table = 'dsdatatable';

$db = mysql_connect($server, $user, $password) or die('Error!');

mysql_select_db($table, $db) or die('Error!');


mysql_fetch_array(mysql_query("SELECT * FROM users"));


//====== ARRAY RETURN ======
$return = array();

//====== SELECT ======
$select = "SELECT * FROM users";

//====== WHERE ======
$where = ' WHERE 1=1 ';
if (isset($_POST['dsSearch']) && $_POST['dsSearch'] != '') {
    $where .= " AND (name LIKE '%" . $_POST['dsSearch'] . "%' OR "
            . "surname LIKE '%" . $_POST['dsSearch'] . "%' OR "
            . "email LIKE '%" . $_POST['dsSearch'] . "%' OR "
            . "department LIKE '%" . $_POST['dsSearch'] . "%' )";
}

//====== LIMIT ======
$start_from = ($_POST['dsPageNow'] - 1) * $_POST['dsRecordPages'];
$limit = " LIMIT " . $start_from . ", " . $_POST['dsRecordPages'];

//====== ORDER ======
$order = '';
if(isset($_POST['dsOrder']) && count($_POST['dsOrder'] !== 0)){
    $order = " ORDER BY";
    foreach($_POST['dsOrder'] as $obj){
        $order .= ' '.$obj['name'].' '.$obj['order'].',';
    }
    $order = substr($order, 0, -1);
}

//====== TOTAL PG ======
$total_rows = mysql_num_rows(mysql_query($select));
$total_rows_query = mysql_num_rows(mysql_query($select . $where));
$total_pages_query = ceil($total_rows_query / $_POST['dsRecordPages']);

$return['total_rows'] = $total_rows;
$return['rows'] = $total_rows_query;
$return['pages'] = $total_pages_query;

//====== FIELDS ====== 
if ($total_rows_query != 0) {
    $sql = mysql_query($select . $where . $order . $limit);
    while ($fields = mysql_fetch_assoc($sql)) {
        $return['fields'][] = $fields;
    }

    $return['start'] = $start_from;
    $return['end'] = $start_from + mysql_num_rows($sql);
}

echo json_encode($return);
