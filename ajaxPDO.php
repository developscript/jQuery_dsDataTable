<?php

/* !
 * 
 * DevelopScript - DataTable v0.6.5 (http://developscript.com)
 * 
 * Licensed under the MIT license.
 * 
 * @file            ajaxPDO.php
 * @author          Rafael Pegorari
 * @date            13/07/2015 
 *
 * @edit            09/11/2015 - comment, SQL Injection.
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

header('Content-type: application/json');

try {
    $conn = new PDO('mysql:host=localhost;dbname=dbname', 'user', 'password');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    //====== ARRAY RETURN ======
    $return = array();
    $parameters = array();
    $columns = array('name', 'department', 'email', 'salary');

    //====== SELECT ======
    $select = "SELECT * FROM users";

    //====== WHERE ======
    $where = ' WHERE 1=1 ';
    if (isset($_POST['dsSearch']) && $_POST['dsSearch'] != '') {
        $parameters[] = "%" . $_POST['dsSearch'] . "%";
        $parameters[] = "%" . $_POST['dsSearch'] . "%";
        $parameters[] = "%" . $_POST['dsSearch'] . "%";
        $parameters[] = "%" . $_POST['dsSearch'] . "%";
        $where .= " AND (name LIKE ? OR "
            . "surname LIKE ? OR "
            . "email LIKE ? OR "
            . "department LIKE ? ";
        if (is_numeric($_POST['dsSearch'])) {
            $parameters[] = $_POST['dsSearch'];
            $where .= " OR salary = ? ";
        } else if (count(explode("-", $_POST['dsSearch'])) === 3) {
            list($Y, $m, $d) = explode("-", $_POST['dsSearch']);
            $Y = intval($Y);
            $m = intval($m);
            $d = intval($d);
            if ($Y !== 0 && $m !== 0 && $d !== 0 && checkdate($m, $d, $Y)) {
                $parameters[] = " . $Y . " - " . $m . " - " . $d . ";
                $where .= " OR date_birth = STR_TO_DATE( ? ,'%Y-%m-%d')";
            }
        }
        $where .= " )";
    }

    //====== LIMIT ======
    $start_from = ($_POST['dsPageNow'] - 1) * $_POST['dsRecordPages'];
    $limit = " LIMIT " . intval($start_from) . ", " . intval($_POST['dsRecordPages']);


    //====== ORDER ======
    $order = '';
    if (isset($_POST['dsOrder']) && count($_POST['dsOrder'] !== 0)) {
        $order = " ORDER BY";
        foreach ($_POST['dsOrder'] as $obj) {
            if ((strtolower($obj['order']) === 'asc' || strtolower($obj['order']) === 'desc') && in_array(strtolower($obj['name']), $columns)) {
                $order .= ' '.$obj['name'].' '.$obj['order'].' ,';
            }
        }
        $order = substr($order, 0, -1);
    }


    //====== TOTAL PG ======
    $total_rows_sql = $conn->prepare($select);
    $total_rows_sql->execute();
    $total_rows = count($total_rows_sql->fetchAll());

    $total_rows_query_sql = $conn->prepare($select . $where);
    $total_rows_query_sql->execute($parameters);
    $total_rows_query = count($total_rows_query_sql->fetchAll());

    $total_pages = ceil($total_rows_query / $_POST['dsRecordPages']);

    $return['total_rows'] = $total_rows;
    $return['rows'] = $total_rows_query;
    $return['pages'] = $total_pages;


    //====== FIELDS ====== 
    if ($total_rows_query != 0) {
        $fields = $conn->prepare($select . $where . $order . $limit);
        $fields->execute($parameters);

        $fields_rows = $fields->fetchAll(\PDO :: FETCH_ASSOC);

        foreach ($fields_rows as $key => $value) {
            $return['fields'][$key] = array_map('utf8_encode', $value);
        }

        $return['start'] = $start_from;
        $return['end'] = $start_from + count($fields_rows);

    }

    echo json_encode($return);

} catch (PDOException $e) {
    echo 'ERROR: ' . $e->getMessage();
}
