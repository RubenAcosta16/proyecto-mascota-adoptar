let especie = 'dog';
let breeds = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

let historalAdopcion = JSON.parse(localStorage.getItem('historalAdopcion')) || [];

const breedSelect = document.getElementById('breed-select');
const breedList = document.getElementById('breed-list');
const sidebar = document.getElementById('sidebar');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const confirmAdoptBtn = document.getElementById('confirm-adopt');
let mascotaSeleccionada = null;

// Botones
document.getElementById('dog-btn').onclick = () => cargarEspecie('dog');
document.getElementById('cat-btn').onclick = () => cargarEspecie('cat');
document.getElementById('open-cart').onclick = () => sidebar.classList.add('active');
document.getElementById('close-cart').onclick = () => sidebar.classList.remove('active');
document.getElementById('clear-cart').onclick = () => {
  carrito = [];
  actualizarCarrito();
};
document.getElementById('adopt-cart').onclick = () => {
  historalAdopcion.push(...carrito);
  localStorage.setItem('historalAdopcion', JSON.stringify(historalAdopcion));
  carrito = [];

  actualizarCarrito();
};

// Modal adopción
confirmAdoptBtn.onclick = () => {
  agregarAlCarrito(mascotaSeleccionada);
  const modal = bootstrap.Modal.getInstance(document.getElementById('adopt-modal'));
  modal.hide();
};

// Cargar razas
function cargarEspecie(tipo) {
  especie = tipo;
  const url = tipo === 'dog' ? 'https://api.thedogapi.com/v1/breeds' : 'https://api.thecatapi.com/v1/breeds';

  fetch(url)
    .then(res => res.json())
    .then(data => {
      breeds = data;
      llenarSelect();
      mostrarBreedCards();
    });
}

function llenarSelect() {
  breedSelect.innerHTML = '<option disabled selected>Seleccione una raza...</option>';
  breeds.forEach(breed => {
    breedSelect.innerHTML += `<option value="${breed.id}">${breed.name}</option>`;
  });

  breedSelect.onchange = mostrarBreedCards;
}

async function mostrarBreedCards() {
  const selectedId = breedSelect.value;
  const lista = selectedId ? breeds.filter(b => b.id == selectedId) : breeds;

  breedList.innerHTML = '';

  for (const breed of lista) {
    let imageUrl = breed.image?.url;

    // Si no tiene imagen, buscar manualmente
    if (!imageUrl) {
      const apiUrl = especie === 'dog'
        ? `https://api.thedogapi.com/v1/images/search?breed_id=${breed.id}`
        : `https://api.thecatapi.com/v1/images/search?breed_id=${breed.id}`;

      try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (data.length > 0) {
          imageUrl = data[0].url;
        } else {
          imageUrl = 'https://via.placeholder.com/300x250?text=Sin+Imagen';
        }
      } catch (error) {
        console.error(error);
        imageUrl = 'https://via.placeholder.com/300x250?text=Error+Imagen';
      }
    }
    // codigo targeta de la raza
    breedList.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card">
          <img src="${imageUrl}" class="card-img-top" alt="${breed.name}">
          <div class="card-body">
            <h5 class="card-title">${breed.name}</h5>
            <p class="card-text">Temperamento: ${breed.temperament || 'Sin descripción disponible.'}</p>
            <p class ="card-text">Tipo de raza: ${breed.breed_group || 'Sin tipo disponible.'}</p>
            <p class ="card-text">Nivel de amigable con niños: ${breed.child_friendly || 'Sin tipo disponible.'}</p>
            <button class="btn btn-primary w-100" onclick="adoptarMascota('${breed.name}', '${imageUrl}')">Adoptar</button>
          </div>
        </div>
      </div>
    `;
  }
}


function adoptarMascota(nombre, imagen) {
  mascotaSeleccionada = { nombre, imagen };
  document.getElementById('adopt-pet-name').textContent = nombre;
  const modal = new bootstrap.Modal(document.getElementById('adopt-modal'));
  modal.show();
}

function agregarAlCarrito(mascota) {
  carrito.push(mascota);
  actualizarCarrito();
}


// cosas del carritofunction actualizarCarrito()
function actualizarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  cartItems.innerHTML = '';

  if (carrito.length === 0) {
    cartItems.innerHTML = '<li class="list-group-item text-center">Tu carrito está vacío 🐾</li>';
  } else {
    carrito.forEach(item => {
      cartItems.innerHTML += `
        <li class="list-group-item d-flex align-items-center">
          <img src="${item.imagen}" alt="${item.nombre}" style="width:50px; height:50px; object-fit:cover; margin-right:10px;">
          <div>${item.nombre}</div>
          <button class="btn btn-danger btn-sm ms-auto" onclick="eliminarDelCarrito('${item.nombre}')">Eliminar</button>

        </li>
      `;
    });
  }
  cartCount.textContent = carrito.length;
}


function eliminarDelCarrito(nombre) {
  carrito = carrito.filter(item => item.nombre !== nombre);
  actualizarCarrito();
}
// Inicial
cargarEspecie('dog');
actualizarCarrito();
