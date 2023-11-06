<?php
    error_reporting(E_ALL);
    ini_set('display_errors', -1);

    $ubicacion = 'actividades/';
    if (!file_exists($ubicacion)) {
        mkdir($ubicacion, 0777, true);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type");
        exit;
    }

    function getNextSequenceNumber($ubicacion) {
        $files = glob($ubicacion . '*.json');
        return count($files);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $actividades = [];
        $actividadFiles = glob($ubicacion . '*.json');
        foreach ($actividadFiles as $activityFile) {
            $actividadData = json_decode(file_get_contents($activityFile), true);
            $actividades[] = $actividadData;
        }
        header('Content-Type: application/json');
        echo json_encode($actividades);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $postData = file_get_contents("php://input");
        $data = json_decode($postData);

        $editIndex = isset($_GET['edit']) ? (int)$_GET['edit'] : null;
        $borrarIndex = isset($_GET['delete']) ? (int)$_GET['delete'] : null;

        if (!empty($data)) {
            if (!is_null($editIndex)) {
                $editIndex = (int)$editIndex;
                $actividadFileName = $ubicacion . $editIndex . '.json';

                if (file_exists($actividadFileName)) {
                    $actividadData = json_decode(file_get_contents($actividadFileName), true);
                    
                    $actividadData['nombre'] = $data->nombre;
                    $actividadData['descripcion'] = $data->descripcion;
                    $actividadData['fechaI'] = $data->fechaI;
                    $actividadData['fechaF'] = $data->fechaF;
                    $actividadData['responsable'] = $data->responsable;

                    file_put_contents($actividadFileName, json_encode($actividadData));

                    $response = [
                        "success" => true,
                        "message" => "Actividad actualizada exitosamente"
                    ];

                    header('Content-Type: application/json');
                    echo json_encode($response);
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => "La actividad no existe"]);
                }
            } elseif (!is_null($borrarIndex)) {
                $borrarIndex = (int)$borrarIndex;
                $actividadFileName = $ubicacion . $borrarIndex . '.json';
            
                if (file_exists($actividadFileName)) {
                    $actividadData = json_decode(file_get_contents($actividadFileName), true);
                    $actividadData['nombre'] = "000x000";
                    file_put_contents($actividadFileName, json_encode($actividadData));
            
                    $response = [
                        "success" => true,
                        "message" => "Actividad ocultada exitosamente"
                    ];
            
                    header('Content-Type: application/json');
                    echo json_encode($response);
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => "La actividad no existe"]);
                }
            } else {
                $nextSequenceNumber = getNextSequenceNumber($ubicacion);
                $actividadFileName = $ubicacion . $nextSequenceNumber . '.json';

                file_put_contents($actividadFileName, json_encode($data));

                $response = [
                    "success" => true,
                    "message" => "Actividad registrada exitosamente"
                ];

                header('Content-Type: application/json');
                echo json_encode($response);
            }
        }
    }
?>