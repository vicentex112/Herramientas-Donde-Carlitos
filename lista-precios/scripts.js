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

// FUNCIÓN DE IMPORTACIÓN (AGREGAR ESTO) -  Puedes quitarla o comentarla después de usarla.
async function importProducts(productsArray) {
    if (!productsArray || productsArray.length === 0) {
        console.error("El array de productos está vacío.");
        return;
    }
    const confirmImport = confirm(`¿Estás seguro de importar ${productsArray.length} productos? Esto sobreescribirá cualquier dato existente en la colección 'products'.`);
    if (!confirmImport) {
        return;
    }

    try {
        // Borra la colección existente (opcional, pero recomendado para una importación limpia)
        const snapshot = await productsCollection.get();
        snapshot.forEach(doc => {
            productsCollection.doc(doc.id).delete();
        });
        console.log("Colección 'products' existente borrada.");

        // Importa los nuevos productos
        for (const product of productsArray) {
            await productsCollection.add(product);
        }
        console.log("Productos importados exitosamente!");
        alert("Productos importados exitosamente!");
        loadProducts(); // Recarga la lista después de la importación

    } catch (error) {
        console.error("Error durante la importación:", error);
        alert("Error durante la importación. Revisa la consola para más detalles.");
    }
}
// FIN DE LA FUNCIÓN DE IMPORTACIÓN


const productsCollection = db.collection("products"); // Nombre de tu colección en Firestore

const priceTable = document.getElementById("priceTable").getElementsByTagName("tbody")[0];
const searchInput = document.getElementById("searchInput");
const lastUpdatedSpan = document.getElementById("lastUpdated");
const editButton = document.getElementById("editButton");
const addProductButton = document.getElementById("addProductButton"); //Boton de agregar producto

let isEditing = false; // Controla el estado de edición
let products = []; // Almacena los productos localmente

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
        nameCell.textContent = product.name;
        priceCell.textContent = product.price;

        //Si está en modo edicion, crea inputs
        if (isEditing){
          makeCellEditable(nameCell, product.id, "name");
          makeCellEditable(priceCell, product.id, "price");
        }
    });
}

//Funcion para hacer las celdas editables
function makeCellEditable(cell, productId, field){
    cell.classList.add("editable");
    const originalValue = cell.textContent;
    cell.innerHTML = `<input type="text" value="${originalValue}">`;
    const inputField = cell.querySelector("input");

    inputField.addEventListener("blur", () => { //Cuando se quita el click de la celda
      const newValue = inputField.value;
        if (newValue !== originalValue) {
          updateProductField(productId, field, newValue); //actualiza el valor
        } else{ //Si no, mostrar valor original
          cell.textContent = originalValue;
          cell.classList.remove("editable");
        }
    });

}

//Funcion para actualizar producto
async function updateProductField(productId, field, newValue) {
    try {
        await productsCollection.doc(productId).update({
            [field]: newValue,
        });
        console.log("Producto actualizado con exito!");

    } catch (error) {
        console.error("Error updating product: ", error);
        alert("Hubo un error al actualizar el producto.");
    }
}


function filterProducts() {
    const searchTerm = removeAccents(searchInput.value.toLowerCase()); // Todo a minúsculas y sin acentos

    const filteredProducts = products.filter(product => {
        const productName = removeAccents(product.name.toLowerCase()); // Todo a minúsculas y sin acentos
        return productName.includes(searchTerm);
    });

    displayProducts(filteredProducts);
}


function updateLastUpdated() {
    const now = new Date();
    lastUpdatedSpan.textContent = now.toLocaleString(); // Formato de fecha y hora local
}

// --- Funciones de Firebase ---

async function loadProducts() {
    try {
        const snapshot = await productsCollection.get();
        products = []; // Limpia el array local
        snapshot.forEach(doc => {
          products.push({ id: doc.id, ...doc.data() });
        });
        displayProducts(products);
        updateLastUpdated(); // Actualiza la fecha aquí después de cargar los productos
        console.log("Productos cargados exitosamente", products);
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        alert("Error al cargar la lista de precios. Por favor, inténtalo de nuevo más tarde.");
    }
}


// --- Manejo de Eventos ---

searchInput.addEventListener("input", filterProducts);

editButton.addEventListener("click", () => {
    isEditing = !isEditing; // Alterna entre modo edición y visualización
    if (isEditing) {
        editButton.textContent = "Guardar Cambios";
         //Vuelve a mostrar los productos, ahora editables.
         displayProducts(products);
    } else {
        editButton.textContent = "Editar Precios";
        const confirmSave = confirm("¿Estás seguro de guardar los cambios?");
        if (confirmSave){
          loadProducts(); //Recarga los productos (actualizados)

        } else {
          displayProducts(products);
        }

    }

});

addProductButton.addEventListener("click", async () => {
    const newProductName = prompt("Ingrese el nombre del nuevo producto:");
    if (!newProductName) return; // Sale si el usuario cancela o deja el nombre en blanco

    const newProductPrice = prompt("Ingrese el precio del nuevo producto:");
    if (!newProductPrice) return;

    try {
        const newProduct = {
            name: newProductName,
            price: newProductPrice,
        };
        const docRef = await productsCollection.add(newProduct);
        products.push({id: docRef.id, ...newProduct}); //Actualiza el array en memoria
        displayProducts(products); //Vuelve a mostrar
        updateLastUpdated();
        alert("Producto agregado con éxito!");

    } catch (error) {
        console.error("Error al agregar producto:", error);
        alert("Error al agregar el producto. Por favor, inténtalo de nuevo.");
    }
});


// --- Inicialización ---

loadProducts();  //Carga inicial desde firestore

