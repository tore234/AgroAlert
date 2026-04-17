<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");


header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conexion = mysqli_connect("localhost", "root", "", "proyecto_final");

// Consultamos las últimas 10 alertas registradas
$sql = "SELECT * FROM historial_alertas ORDER BY fecha_deteccion DESC LIMIT 10";
$resultado = mysqli_query($conexion, $sql);

$alertas = [];
while($fila = mysqli_fetch_assoc($resultado)) {
    $alertas[] = $fila;
}

echo json_encode($alertas);
?>