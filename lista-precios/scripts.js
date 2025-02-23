// Firebase configuration (USA TUS CREDENCIALES REALES)
const firebaseConfig = {
    apiKey: "AIzaSyAuBJegABmONCeBe_ekpLEEbThEdx15BfM",
    authDomain: "lista-de-precios-memoria.firebaseapp.com",
    projectId: "lista-de-precios-memoria",
    storageBucket: "lista-de-precios-memoria.firebasestorage.app",
    messagingSenderId: "1011745847176",
    appId: "1:1011745847176:web:2b2dad74a2227e5e49ac3d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const productsCollection = db.collection("products");

const priceTable = document.getElementById("priceTable").getElementsByTagName("tbody")[0];
const searchInput = document.getElementById("searchInput");
const lastUpdatedSpan = document.getElementById("lastUpdated");
const editButton = document.getElementById("editButton");
const addProductButton = document.getElementById("addProductButton");

let isEditing = false;
let products = [];

// --- Funciones de Utilidad ---

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function displayProducts(productsToDisplay) {
    priceTable.innerHTML = "";
    productsToDisplay.forEach(product => {
        let row = priceTable.insertRow();
        let nameCell = row.insertCell();
        let priceCell = row.insertCell();
        let deleteCell = row.insertCell(); // Celda para el botón eliminar

        nameCell.textContent = product.name;
        priceCell.textContent = product.price;

        if (isEditing) {
            makeCellEditable(nameCell, product.id, "name");
            makeCellEditable(priceCell, product.id, "price");
            // Botón eliminar SOLO en modo edición
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Eliminar";
            deleteButton.classList.add("delete-button"); // Clase para CSS
            deleteButton.addEventListener("click", () => deleteProduct(product.id));
            deleteCell.appendChild(deleteButton);

        } else {
            deleteCell.textContent = ""; // Celda vacía si no editando
        }
    });
}
//Modificada
function makeCellEditable(cell, productId, field) {
    cell.classList.add("editable");
    const originalValue = cell.textContent;
    cell.innerHTML = `<input type="text" value="${originalValue}">`;
    const inputField = cell.querySelector("input");

    inputField.addEventListener("blur", () => {
        const newValue = inputField.value;
        if (newValue !== originalValue) {
            updateProductField(productId, field, newValue);
        } else {
            cell.textContent = originalValue;
            cell.classList.remove("editable");
        }
    });
}

async function updateProductField(productId, field, newValue) {
    try {
        await productsCollection.doc(productId).update({
            [field]: newValue,
        });
        console.log("Producto actualizado con éxito!");
    } catch (error) {
        console.error("Error updating product: ", error);
        alert("Hubo un error al actualizar el producto.");
    }
}

// NUEVA FUNCIÓN PARA ELIMINAR
async function deleteProduct(productId) {
    const confirmDelete = confirm("¿Estás seguro de que quieres eliminar este producto?");
    if (confirmDelete) {
        try {
            await productsCollection.doc(productId).delete();
            console.log("Producto eliminado con éxito!");
            // Actualizar la lista local (más eficiente que recargar todo)
            products = products.filter(product => product.id !== productId);
            displayProducts(products);
            updateLastUpdated();
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            alert("Hubo un error al eliminar el producto.");
        }
    }
}

function filterProducts() {
    const searchTerm = removeAccents(searchInput.value.toLowerCase());
    const filteredProducts = products.filter(product =>
        removeAccents(product.name.toLowerCase()).includes(searchTerm)
    );
    displayProducts(filteredProducts);
}

function updateLastUpdated() {
    const now = new Date();
    lastUpdatedSpan.textContent = now.toLocaleString();
}

// --- Funciones de Firebase ---

async function loadProducts() {
    try {
        const snapshot = await productsCollection.get();
        products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        displayProducts(products);
        updateLastUpdated();
        console.log("Productos cargados exitosamente", products);
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        alert("Error al cargar la lista de precios. Inténtalo de nuevo.");
    }
}

// --- Manejo de Eventos ---

searchInput.addEventListener("input", filterProducts);

editButton.addEventListener("click", () => {
    isEditing = !isEditing;
    if (isEditing) {
        editButton.textContent = "Guardar Cambios";
    } else {
        editButton.textContent = "Editar Precios";
        const confirmSave = confirm("¿Estás seguro de guardar los cambios?");
        if (confirmSave) {
            loadProducts(); // Recarga para reflejar los cambios (o los descarta)
        }
    }
     displayProducts(products); //  Para mostrar/ocultar botones
});

addProductButton.addEventListener("click", async () => {
    const newProductName = prompt("Ingrese el nombre del nuevo producto:");
    if (!newProductName) return;

    const newProductPrice = prompt("Ingrese el precio del nuevo producto:");
    if (!newProductPrice) return;

    try {
        const newProduct = { name: newProductName, price: newProductPrice };
        const docRef = await productsCollection.add(newProduct);
        products.push({ id: docRef.id, ...newProduct });
        displayProducts(products);
        updateLastUpdated();
        alert("Producto agregado con éxito!");
    } catch (error) {
        console.error("Error al agregar producto:", error);
        alert("Error al agregar el producto. Inténtalo de nuevo.");
    }
});

// --- Función para generar el PDF ---
function generatePDF() {
        // Crea un nuevo documento PDF (en formato vertical y tamaño A4)
      const { jsPDF } = jspdf;
      const doc = new jsPDF();

        // Título
        doc.setFontSize(22);
        doc.text("Lista de Precios", 20, 20);

        // Fecha (dd-mm-aaaa)
        const today = new Date();
        const formattedDate = `<span class="math-inline">\{today\.getDate\(\)\}\-</span>{today.getMonth() + 1}-${today.getFullYear()}`;
        doc.setFontSize(12);
        doc.text(`Fecha: ${formattedDate}`, 20, 30);

        // Crear la tabla (de forma manual, no hay una función de tabla automática en jsPDF básico)
    let yOffset = 40; // Posición vertical inicial

    // Encabezados de la tabla
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold'); // Fuente en negrita para los encabezados
    doc.text("Producto", 20, yOffset);
    doc.text("Precio", 100, yOffset); // Ajusta la posición horizontal según necesites
    yOffset += 10; // Espacio después de los encabezados
     doc.line(20, yOffset, 190, yOffset);
     yOffset += 5;
      doc.setFont('helvetica', 'normal'); // Fuente normal para los datos
    // Recorrer los productos *actuales* (los que se muestran en la tabla)
    products.forEach(product => { //Usa el array en memoria
        doc.setFontSize(10);
        doc.text(product.name, 20, yOffset);
        doc.text(product.price, 100, yOffset); // Ajusta la posición
        yOffset += 7; // Espacio entre filas

        //Salto de pagina
        if(yOffset >= 280){
          doc.addPage();
          yOffset = 20;

             // Encabezados de la tabla
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold'); // Fuente en negrita para los encabezados
                doc.text("Producto", 20, yOffset);
                doc.text("Precio", 100, yOffset); // Ajusta la posición horizontal según necesites
                yOffset += 10; // Espacio después de los encabezados
                doc.line(20, yOffset, 190, yOffset);
                yOffset += 5;
