<?php

/* !
 * 
 * DevelopScript - DataTable v0.6.0 (http://developscript.com)
 * 
 * Licensed under the MIT license.
 * 
 * @file            ajax.php
 * @author          Rafael Pegorari
 * @date            13/07/2015 
 * 
 * 
 * ====== Get ======
 * ['dsRecordPages']    => Amounts of records per page.
 * ['dsSearch']         => String to input search.
 * ['dsPageNow']        => Current page.
 * ['dsOrder']          => Order of the columns = ['dsOrder'][*] = array("name" => "nameColumn", "order" => "ASC||DESC").
 * 
 * 
 * ====== Returns ======
 * $return['total_rows']  => Total table rows.
 * $return['rows']        => Total table rows - query.
 * $return['pages']       => Full table pages = ceil($total_rows_query / $_POST['dsRecordPages']).
 * $return['fields'][]    => Associated fields ex.['name'] => 'Rafael', ['surname'] => 'Pegorari'. 
 * ****** Name and surname fields must be set in. ******
 * .dsDataTable({
 *               columns: [
 *                   {name: "name"},
 *                   {name: "surname"}
 *              ],
 * *****************************************************
 * $return['start']       => Start to limit.
 * $return['end']         => End to limit = $start_from + mysql_num_rows($sql).
 * 
 */

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
            . "department LIKE '%" . $_POST['dsSearch'] . "%' ";
    if (is_numeric($_POST['dsSearch'])) {
        $where .= " OR salary = " . $_POST['dsSearch'];
    }
    else if (count(explode("-", $_POST['dsSearch'])) === 3) {
        list($Y, $m, $d) = explode("-", $_POST['dsSearch']);
        $Y = intval($Y);
        $m = intval($m);
        $d = intval($d);
        if ($Y !== 0 && $m !== 0 && $d !== 0 && checkdate($m, $d, $Y)) {
            $where .= " OR date_birth = STR_TO_DATE('" . $Y . "-" . $m . "-" . $d . "','%Y-%m-%d')";
        }
    }
    $where .= " )";
}

//====== LIMIT ======
$start_from = ($_POST['dsPageNow'] - 1) * $_POST['dsRecordPages'];
$limit = " LIMIT " . $start_from . ", " . $_POST['dsRecordPages'];

//====== ORDER ======
$order = '';
if (isset($_POST['dsOrder']) && count($_POST['dsOrder'] !== 0)) {
    $order = " ORDER BY";
    foreach ($_POST['dsOrder'] as $obj) {
        $order .= ' ' . $obj['name'] . ' ' . $obj['order'] . ',';
    }
    $order = substr($order, 0, -1);
}

//====== TOTAL PG ======
$total_rows = mysql_num_rows(mysql_query($select));
$total_rows_query = mysql_num_rows(mysql_query($select . $where));
$total_pages = ceil($total_rows_query / $_POST['dsRecordPages']);

$return['total_rows'] = $total_rows;
$return['rows'] = $total_rows_query;
$return['pages'] = $total_pages;

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
