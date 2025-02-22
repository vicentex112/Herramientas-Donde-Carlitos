// Firebase configuration (REEMPLAZA CON TU CONFIGURACIÓN)
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
// YA NO ES NECESARIO UN ARRAY LOCAL: let products = [];

// --- Funciones de Utilidad ---

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function displayProducts(snapshot) { // Recibe el snapshot de Firestore
    priceTable.innerHTML = ""; // Limpia la tabla

    snapshot.forEach(doc => {  // Itera directamente sobre los documentos
        const product = { id: doc.id, ...doc.data() }; // Crea el objeto product

        let row = priceTable.insertRow();
        let nameCell = row.insertCell();
        let priceCell = row.insertCell();
        nameCell.textContent = product.name;
        priceCell.textContent = product.price;

        if (isEditing) {
            makeCellEditable(nameCell, product.id, "name");
            makeCellEditable(priceCell, product.id, "price");
        }
    });

     updateLastUpdated(); //Actualiza despues de renderizar
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

async function updateProductField(productId, field, newValue) {
    try {
        await productsCollection.doc(productId).update({
            [field]: newValue,
        });
        console.log("Producto actualizado con éxito!");
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        alert("Hubo un error al actualizar el producto.");
    }
}

function filterProducts() {
    // El filtro ahora se hace en el backend (Firestore)
    const searchTerm = removeAccents(searchInput.value.toLowerCase());

     // Consulta a Firestore con filtro.
    let query = productsCollection; // Inicia con la colección completa
    if (searchTerm) { // Si hay un término de búsqueda...
       query = query.where('name', '>=', searchTerm).where('name', '<=', searchTerm + '\uf8ff');
    }

     // Usa onSnapshot en la consulta filtrada (o la colección completa si no hay filtro)
      query.onSnapshot(displayProducts, (error) => {
        console.error("Error al obtener datos en tiempo real:", error);
        alert("Error al obtener la lista de precios. Inténtalo de nuevo.");
    });
}

function updateLastUpdated() {
    const now = new Date();
    lastUpdatedSpan.textContent = now.toLocaleString();
}

// --- Manejo de Eventos ---

searchInput.addEventListener("input", filterProducts);

editButton.addEventListener("click", () => {
    isEditing = !isEditing;
    if (isEditing) {
        editButton.textContent = "Guardar Cambios";
    } else {
        editButton.textContent = "Editar Precios";
        // Ya no necesitas confirmación aquí, porque los cambios se guardan individualmente
    }
    // Forzar una re-renderización.  No necesitamos loadProducts() porque onSnapshot se encarga.
    // Usamos la última "instantánea" de los datos que tenemos.
    displayProducts(lastSnapshot);
});

addProductButton.addEventListener("click", async () => {
    const newProductName = prompt("Ingrese el nombre del nuevo producto:");
    if (!newProductName) return;

    const newProductPrice = prompt("Ingrese el precio del nuevo producto:");
    if (!newProductPrice) return;

    try {
        const newProduct = {
            name: newProductName,
            price: newProductPrice,
        };
        await productsCollection.add(newProduct); // Solo agrega a Firestore
        // NO actualizamos un array local.  onSnapshot se encargará.
        // updateLastUpdated();  <-  displayProducts ya lo llama
        alert("Producto agregado con éxito!");
    } catch (error) {
        console.error("Error al agregar producto:", error);
        alert("Error al agregar el producto. Inténtalo de nuevo.");
    }
});

// --- Inicialización ---
// Usamos onSnapshot para escuchar cambios en tiempo real
let lastSnapshot = null; //Almacena la ultima actualizacion de datos
productsCollection.onSnapshot(snapshot => {
    lastSnapshot = snapshot; //Guarda la actualizacion mas reciente.
    displayProducts(snapshot);
}, (error) => {
    console.error("Error al obtener datos en tiempo real:", error);
    alert("Error al obtener la lista de precios. Inténtalo de nuevo.");
});
