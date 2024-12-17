const menu = document.querySelector('#menu');
const cartBtn = document.querySelector('#cart-btn');
const cartModal = document.querySelector('#cart-modal');
const cartItemsContainer = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const checkoutBtn = document.querySelector('#checkout-btn');
const closeModalBtn = document.querySelector('#close-modal-btn');
const cartCounter = document.querySelector('#cart-count');
const addressInput = document.querySelector('#address');
const addressWarn = document.querySelector('#address-warn');

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

menu.addEventListener('click', (event) => {
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

    cartCounter.textContent = cart.length;
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

            updateCartModal()

            return;
        }

        cart.splice(index, 1);

        updateCartModal();
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

    if (cart.length === 0) {
        return;
    }

    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");

        return;
    }

    // zapzap api
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

const spanItem = document.querySelector('#date-span');
const isOpen = checkRestaurantOpen();

if (isOpen) {
    spanItem.classList.remove("bg-red-500");
    spanItem.add("bg-green-600");

} else {
    spanItem.classList.remove("bg-green-600");
    spanItem.classList.add("bg-red-500");
}