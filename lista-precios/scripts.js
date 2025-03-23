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
const lastModifiedRef = db.collection("metadata").doc("lastModified"); // Referencia al documento de control


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

// --- MODIFICADA: updateProductField ---
async function updateProductField(productId, field, newValue) {
    try {
        await productsCollection.doc(productId).update({
            [field]: newValue,
        });
        // AÑADE ESTO: Actualiza el timestamp de última modificación
        await lastModifiedRef.set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        console.log("Producto actualizado con éxito!");
    } catch (error) {
        console.error("Error updating product: ", error);
        alert("Hubo un error al actualizar el producto.");
    }
}

// --- MODIFICADA: deleteProduct ---
async function deleteProduct(productId) {
    const confirmDelete = confirm("¿Estás seguro de que quieres eliminar este producto?");
    if (confirmDelete) {
        try {
            await productsCollection.doc(productId).delete();
            // AÑADE ESTO: Actualiza el timestamp de última modificación
            await lastModifiedRef.set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });
            console.log("Producto eliminado con éxito!");
            products = products.filter(product => product.id !== productId);
            displayProducts(products);
             loadLastModified(); //  Actualiza la visualización
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

// --- MODIFICADA:  Ya no actualiza la hora aquí ---
function updateLastUpdated() {
  //Esta funcion ya no se usara.
}

// --- NUEVA FUNCIÓN: loadLastModified ---
async function loadLastModified() {
    try {
        const doc = await lastModifiedRef.get();
        if (doc.exists) {
            const timestamp = doc.data().timestamp;
            if (timestamp) { //  Verifica si el timestamp existe
                const lastModifiedDate = timestamp.toDate(); // Convierte a objeto Date de JavaScript
                lastUpdatedSpan.textContent = lastModifiedDate.toLocaleString(); // Formatea y muestra
            } else {
                lastUpdatedSpan.textContent = "Nunca modificado"; //  Si no hay timestamp
            }
        } else {
            lastUpdatedSpan.textContent = "No encontrado"; //  Si el documento no existe
             await lastModifiedRef.set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() }); //Lo crea
             loadLastModified(); //Vuelve a intentar
        }
    } catch (error) {
        console.error("Error al cargar la fecha de última modificación:", error);
        lastUpdatedSpan.textContent = "Error al cargar";
    }
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
        //  Ya NO actualiza la fecha aquí
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
            loadProducts();
        }
    }
    displayProducts(products);
});

// --- MODIFICADA: addProductButton ---
addProductButton.addEventListener("click", async () => {
    const newProductName = prompt("Ingrese el nombre del nuevo producto:");
    if (!newProductName) return;

    const newProductPrice = prompt("Ingrese el precio del nuevo producto:");
    if (!newProductPrice) return;

    try {
        const newProduct = { name: newProductName, price: newProductPrice };
        const docRef = await productsCollection.add(newProduct);
        // AÑADE ESTO: Actualiza el timestamp de última modificación
        await lastModifiedRef.set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        products.push({ id: docRef.id, ...newProduct });
        displayProducts(products);
        loadLastModified(); //  Actualiza la visualización
        alert("Producto agregado con éxito!");
    } catch (error) {
        console.error("Error al agregar producto:", error);
        alert("Error al agregar el producto. Inténtalo de nuevo.");
    }
});

// --- Función para generar el PDF ---
function generatePDF() {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Lista de Precios", 20, 20);

    const today = new Date();
    const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    doc.setFontSize(12);
    doc.text(`Fecha: ${formattedDate}`, 20, 30);

    let yOffset = 40;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Producto", 20, yOffset);
    doc.text("Precio", 100, yOffset);
    yOffset += 10;
    doc.line(20, yOffset, 190, yOffset);
    yOffset += 5;
    doc.setFont('helvetica', 'normal');

    products.forEach(product => {
        doc.setFontSize(10);
        doc.text(product.name, 20, yOffset);
        doc.text(product.price, 100, yOffset);
        yOffset += 7;

        if (yOffset >= 280) {
            doc.addPage();
            yOffset = 20;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text("Producto", 20, yOffset);
            doc.text("Precio", 100, yOffset);
            yOffset += 10;
            doc.line(20, yOffset, 190, yOffset);
            yOffset += 5;
            doc.setFont('helvetica', 'normal');
        }
    });

    doc.save(`Lista_de_Precios_${formattedDate}.pdf`);
}

document.getElementById("generatePdfButton").addEventListener("click", generatePDF);

// --- Inicialización ---
loadLastModified(); // Carga la fecha de última modificación *primero*
loadProducts(); // *Luego* carga los productos
