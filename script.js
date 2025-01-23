const cardapio = document.querySelector('#cardapio');
const cartBtn = document.querySelector('#cart-btn');
const cartModal = document.querySelector('#cart-modal');
const cartItemsContainer = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const checkoutBtn = document.querySelector('#checkout-btn');
const closeModalBtn = document.querySelector('#close-modal-btn');
const cartCounter = document.querySelector('#cart-count');
const addressInput = document.querySelector('#address');
const addressWarn = document.querySelector('#address-warn');
const searchInput = document.querySelector('#search-input');
const filterButtons = document.querySelectorAll('.category-btn');

let activeCategory = "all";

let cart = [];

// Open cart modal
cartBtn.addEventListener('click', () => {
    updateCartModal();
    cartModal.style.display = 'flex';
});

// Close Modal click out
cartModal.addEventListener('click', (event) => {
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

// Close modal btn
closeModalBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

cardapio.addEventListener('click', (event) => {
    let parentButton = event.target.closest('.add-to-cart-btn');

    if (parentButton) {
        const name = parentButton.getAttribute('data-name');
        const price = parseFloat(parentButton.getAttribute('data-price'));
        const image = parentButton.getAttribute('data-image');

        addToCart(name, price, image);
    }
});

function addToCart(name, price, image) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
            image
        });
    }

    updateCartModal();

    Toastify({
        text: "Item adicionado ao carrinho",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "#4CAF50"
        }
    }).showToast();
}

function updateCartModal() {
    cartItemsContainer.innerHTML = "";

    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('flex', 'justify-between', 'mb-4', 'flex-col');

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <img src="${item.image}" class="w-12 h-12 rounded-md" alt="${item.name}">
                    <div>
                        <p class="font-medium">${item.name}</p>
                        <p>Qtd: ${item.quantity}</p>
                        <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                    </div>
                </div>

                <button 
                    class="remove-from-cart-btn bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    data-name="${item.name}"
                >
                    Remover
                </button>
            </div>
        `;

        total += item.quantity * item.price;

        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString('pt-BR', {
        style: "currency",
        currency: "BRL"
    });

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCounter.textContent = totalItems;
}

// Remove item cart
cartItemsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");

        removeItemCart(name);
    }
});

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cart[index];

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(index, 1);
        }

        updateCartModal();

        Toastify({
            text: "Item removido do carrinho",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#FF5252"
            }
        }).showToast();
    }
}

addressInput.addEventListener("input", (event) => {
    let inputValue = event.target.value;

    if (inputValue !== "") {
        addressInput.classList.remove("border-red-500");
        addressWarn.classList.add("hidden");
    }
});

// End Order
checkoutBtn.addEventListener("click", () => {
    const restaurantIsOpen = checkRestaurantOpen();

    if (!restaurantIsOpen) {
        Toastify({
            text: "Ops, o restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#ef4444"
            }
        }).showToast();

        return;
    }

    if (cart.length === 0) return;

    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    // WhatsApp API
    const cartItems = cart.map(item => {
        return (
            ` ${item.name} Quantidade: (${item.quantity}) Preço: R$ ${item.price} |`
        );
    }).join("");

    const message = encodeURIComponent(cartItems);
    const phone = "40028922";

    window.open(`https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}`, "_blank");

    cart = [];
    updateCartModal();

    Toastify({
        text: "Pedido realizado com sucesso!",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "#16a34a"
        }
    }).showToast();
});

function checkRestaurantOpen() {
    const date = new Date();
    const hour = date.getHours();
    return hour >= 18 && hour < 23;
}

const horarioSpan = document.querySelector('#horario');
const isOpen = checkRestaurantOpen();

if (isOpen) {
    horarioSpan.classList.remove("bg-red-500");
    horarioSpan.classList.add("bg-green-600");
} else {
    horarioSpan.classList.remove("bg-green-600");
    horarioSpan.classList.add("bg-red-500");
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        activeCategory = button.getAttribute('data-category');

        filterButtons.forEach(btn => {
            btn.classList.remove('bg-blue-600', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-800');
        });

        button.classList.add('bg-blue-600', 'text-white');
        button.classList.remove('bg-gray-200', 'text-gray-800');

        const searchValue = formatString(searchInput.value);
        filterItems(searchValue, activeCategory);
    });
});

searchInput.addEventListener('input', (event) => {
    const searchValue = formatString(event.target.value);
    filterItems(searchValue, activeCategory);
});

function formatString(value) {
    return value.toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function filterItems(searchValue, category) {
    const items = cardapio.querySelectorAll('.item');
    const bebidasHeader = document.querySelector('#bebidas-header');
    let hasBebidas = false;

    items.forEach(item => {
        const itemTitle = item.querySelector('.item-title');
        const itemDescription = item.querySelector('.item-description');
        const itemCategory = item.getAttribute('data-category');

        const matchesSearch = formatString(itemTitle.textContent).includes(searchValue) ||
            formatString(itemDescription.textContent).includes(searchValue);
        const matchesCategory = category === 'all' || itemCategory === category;

        if (matchesSearch && matchesCategory) {
            item.style.display = 'block';
            if (itemCategory === 'bebidas') {
                hasBebidas = true;
            }
        } else {
            item.style.display = 'none';
        }
    });

    if (!hasBebidas) {
        bebidasHeader.style.display = 'none';
    } else {
        bebidasHeader.style.display = 'block';
    }
}