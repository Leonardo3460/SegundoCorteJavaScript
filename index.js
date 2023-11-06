let editando = false;
let formulario;
let data;

function cargar() {
    const lista = document.getElementById("lista");
    formulario = document.getElementById("formulario");
    
    fetch("https://corte3ent1.000webhostapp.com/api.php")
        .then(response => response.json())
        .then(actividades => {
            lista.innerHTML = "";
            formulario.removeAttribute("data-edit-index");
            actividades.forEach((actividad, index) => {
                if (actividad.nombre !== "000x000") {
                    const row = lista.insertRow();
                    const nombreCell = row.insertCell(0);
                    const descripcionCell = row.insertCell(1);
                    const fechaICell = row.insertCell(2);
                    const fechaFCell = row.insertCell(3);
                    const diasRestantesCell = row.insertCell(4);
                    const responsableCell = row.insertCell(5);
                    const actionsCell = row.insertCell(6);
            
                    nombreCell.innerHTML = actividad.nombre;
                    descripcionCell.innerHTML = actividad.descripcion;
                    fechaICell.innerHTML = actividad.fechaI;
                    fechaFCell.innerHTML = actividad.fechaF;
                    diasRestantesCell.innerHTML = calculardiasRestantes(actividad.fechaF);
                    responsableCell.innerHTML = actividad.responsable;
            
                    const editarBoton = document.createElement('button');
                    editarBoton.textContent = 'Modificar';
                    editarBoton.classList.add('btn', 'btn-secondary');
                    editarBoton.addEventListener('click', () => {
                        editando = true;

                        document.getElementById("nombre").value = actividad.nombre;
                        document.getElementById("descripcion").value = actividad.descripcion;
                        document.getElementById("fechaI").value = actividad.fechaI;
                        document.getElementById("fechaF").value = actividad.fechaF;
                        document.getElementById("responsable").value = actividad.responsable;

                        document.querySelector("button[type=submit]").textContent = "Modificar actividad";

                        formulario.setAttribute("data-edit-index", index);
                    });

                    const borrarBoton = document.createElement('button');
                    borrarBoton.textContent = 'Eliminar';
                    borrarBoton.classList.add('btn', 'btn-danger');
                    borrarBoton.addEventListener('click', () => {
                        const confirmar = confirm("¿Estás seguro de que quieres eliminar esta actividad?");
                        if (confirmar) {
                            const borrarIndex = index;
                            fetch(`https://corte3ent1.000webhostapp.com/api.php?delete=${borrarIndex}`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(data)
                            })
                            .then(response => response.json())
                            .then(result => {
                                console.log(result);
                                formulario.removeAttribute("data-edit-index");
                                form.reset();
                                cargar();
                            })
                            .catch(error => {
                                console.error("Error al eliminar la actividad: " + error);
                                cargar();
                            });
                        }
                    });
                    
                    actionsCell.appendChild(editarBoton);
                    actionsCell.appendChild(borrarBoton);
                }
            });
        })
        .catch(error => {
            console.error("Error al cargar las actividades: " + error);
        });
}

document.addEventListener("DOMContentLoaded", function () {
    cargar();

    const form = document.getElementById("formulario");
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const descripcion = document.getElementById("descripcion").value;
        const fechaI = document.getElementById("fechaI").value;
        const fechaF = document.getElementById("fechaF").value;
        const responsable = document.getElementById("responsable").value;

        data = {
            nombre: nombre,
            descripcion: descripcion,
            fechaI: fechaI,
            fechaF: fechaF,
            responsable: responsable
        };

        if (editando) {
            const editIndex = formulario.getAttribute("data-edit-index");
            fetch(`https://corte3ent1.000webhostapp.com/api.php?edit=${editIndex}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                console.log(result);
                editando = false;
                formulario.removeAttribute("data-edit-index");
                document.querySelector("button[type=submit]").textContent = "Registrar actividad";
                form.reset();
                cargar();
            })
            .catch(error => {
                console.error("Error al enviar los datos de actualización: " + error);
            });
        }

        fetch("https://corte3ent1.000webhostapp.com/api.php", {
            method: editando ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            cargar();
        })
        .catch(error => {
            console.error("Error al enviar los datos: " + error);
        });
    });
});

function calculardiasRestantes(fechaF) {
    const hoy = new Date();
    const fechaf = new Date(fechaF);
    const diferencia = fechaf - hoy;
    const diasRestantes = Math.floor((diferencia / (1000 * 60 * 60 * 24))+2);
    return diasRestantes;
}