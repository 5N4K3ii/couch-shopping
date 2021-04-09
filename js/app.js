
var ITEM_ID_ATTR_NAME = 'data-contractid';
var ITEM_CAT_ATTR_NAME = 'data-categoryid';
var ITEM_REMOVE_CONFIRM = 'Are you sure?';
var CART_REMOVE_CONFIRM = 'Clear all items in cart.  Are you sure?';
var NO_ITEMS_TEXT = 'No items';

class ShoppingBase {

    constructor(storeClass, remote, dbname, shoppingChangeHandler) {
        this.shoppingChangeHandler = shoppingChangeHandler;
        this.isShopping = false;
        this.store = new storeClass(dbname, remote, () => {
            this.refresh();
        });

        this.init();
        this.refresh();
        this.toggleItemFormEditing(false);
    }

    init() {
        this.initElements();
        this.initItemTemplate();
        this.attachHandlers();
    }

    initElements() {
        this.itemList = document.getElementById('itemList');

        this.listItemDetailsSection = document.getElementById('listItemDetailSection');
        this.listItemDetailsForm = document.getElementById('listItemDetails');
        this.listItemIdField = document.getElementById('listItemId');
        this.itemnameField = document.getElementById('itemname');
        this.categoryField = document.getElementById('category');
        this.incartField = document.getElementById('incart');

        this.addListItemButton = document.getElementById('addListItem');
        this.editListItemButton = document.getElementById('editListItem');
        this.removeListItemButton = document.getElementById('removeListItem');
        this.saveListItemButton = document.getElementById('saveListItem');
        this.cancelEditButton = document.getElementById('cancelEdit');

        let aisleHolder = document.getElementById('aisle-holder');
        let attr = aisleHolder.getAttribute('data-aisles');
        this.aisles = JSON.parse(attr);
        for (let i=0; i < this.aisles.length; i++) {
          if (!this.aisles[i].incart) {
            let x = document.createElement("OPTION");
            x.value = this.aisles[i].category;
            x.text = this.aisles[i].item;
            this.categoryField.appendChild(x);
          }
        }
    }

    initItemTemplate() {
        var itemListItem = this.itemList.querySelector('li');
        this.itemList.removeChild(itemListItem);
        this._itemTemplate = itemListItem;
    }

    attachHandlers() {
        this.listItemDetailsForm.addEventListener('submit', event => {
            event.preventDefault();
        });

        this.itemnameField.addEventListener('keyup', event => {
          if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            this.saveListItemButton.click();
          }
        });

        this.addListItemButton.addEventListener('click', () => { this.addListItem(1) });
        this.editListItemButton.addEventListener('click', () => { this.editListItem() });
        this.removeListItemButton.addEventListener('click', () => { this.removeListItem() });
        this.saveListItemButton.addEventListener('click', () => { this.saveListItem() });
        this.cancelEditButton.addEventListener('click', () => { this.cancelEdit() });
    }

    refresh() {
        this.store.getAll().then(items => {
            //Signal for shopping mode
            let newIsShopping = ((items.filter(item => item.incart).length) > 0)
            let didUpdate = (newIsShopping != this.isShopping)
            this.isShopping = newIsShopping
            if (didUpdate && (this.shoppingChangeHandler != null)) {
              this.shoppingChangeHandler()
            }

            //standard refresh logic
            let itemList = items.concat(this.aisles);
            this.sortItems(itemList);
            this.renderitemList(itemList);
        });
    }

    sortItems(itemList) {
        itemList.sort((item1, item2) => {
            let diff = 0;
            if (item1.incart == item2.incart){
              diff = 0;
            } else {
              if (item1.incart) {
                diff = 1;
              } else {
                diff = -1;
              }
            }

            if (diff != 0) return diff;

            diff = item1.category - item2.category;

            if (diff != 0) return diff;

            if (item1._id === undefined) {
              diff = -1;
            } else if (item2._id === undefined) {
              diff = 1;
            } else {
              diff = 0;
            }

            if (diff != 0) return diff;

            diff = item1.item.localeCompare(item2.item);

            return diff;
        });
    }

    renderitemList(items) {
        this.itemList.innerHTML = '';
        this.itemList.appendChild(this.createitemList(items));
    }

    createitemList(items) {
        if(!items.length)
            return this.createNoDataItem();

        var result = document.createDocumentFragment();

        items.forEach(item => {
            result.appendChild(this.createItem(item))
        });

        return result;
    }

    createNoDataItem() {
        var result = document.createElement('li');
        result.className = 'shopping-list-list-empty';
        result.textContent = NO_ITEMS_TEXT;
        return result;
    }

    createItem(item) {
        var result = this._itemTemplate.cloneNode(true);
        result.setAttribute(ITEM_ID_ATTR_NAME, item._id);
        result.setAttribute(ITEM_CAT_ATTR_NAME, item.category);
        result.querySelector('.shopping-item-name').innerText = item.item;
        result.querySelector('.shopping-item-category').innerText = item.category;
        result.querySelector('.shopping-item-incart').innerText = item.incart;
        if (item._id) {
          result.querySelector('.add-item').classList.add('invisible');
          result.querySelector('.clear-list').classList.add('invisible');
        } else {
          result.classList.add('category');
          result.querySelector('.cart-toggle').classList.add('invisible');
          result.querySelector('.edit-item').classList.add('invisible');
          result.querySelector('.delete-item').classList.add('invisible');
          if (item.incart) {
            result.querySelector('.add-item').classList.add('invisible');
          } else {
            result.querySelector('.clear-list').classList.add('invisible');
          }
        }
        result.querySelector('.cart-toggle').addEventListener('click', event => { this.toggleCart(event) });
        result.querySelector('.edit-item').addEventListener('click', async (event) => { await this.showItem(event); this.editListItem() });
        result.querySelector('.delete-item').addEventListener('click', event => { this.deleteItem(event) });
        result.querySelector('.add-item').addEventListener('click', event => { this.addListItem(item.category) });
        result.querySelector('.clear-list').addEventListener('click', event => { this.clearCart() });

        // result.addEventListener('click', event => { this.showItem(event) });
        return result;
    }

    async clearCart() {
      if(!window.confirm(CART_REMOVE_CONFIRM))
          return;

      await this.store.getAll().then(async (items) => {
          // console.log("InitListLength=", items.length);
          let cartList = items.filter(item => item.incart).map(item => item._id);
          // console.log("CartItems", cartList);
          for (let i = 0; i < cartList.length; i++) {
            await this.store.remove(cartList[i]);
          }
      });

      this.refresh();
    }

    findListNode(target) {
      let result = target
      while (result.tagName != "LI") {
        result = result.parentNode
      }
      return result
    }

    toggleCart(event) {
        var listItemId = this.findListNode(event.currentTarget).getAttribute(ITEM_ID_ATTR_NAME);
        // console.log("ItemID=", listItemId);
        this.store.get(listItemId).then(item => {
            this.setlistItemDetails(item);
            // console.log("incart=", item.incart);
            this.incartField.value = item.incart ? "false" : "true";
            this.saveListItem();
        })
    }

    deleteItem(event) {
        var listItemId = this.findListNode(event.currentTarget).getAttribute(ITEM_ID_ATTR_NAME);

        this.store.get(listItemId).then(item => {
            this.setlistItemDetails(item);
            this.removeListItem();
        })
    }

    showItem(event) {
        var listItemId = this.findListNode(event.currentTarget).getAttribute(ITEM_ID_ATTR_NAME);
        // console.log("ItemID=", listItemId);
        return this.store.get(listItemId).then(item => {
            this.setlistItemDetails(item);
            this.listItemDetailsSection.style.display = "block";
            this.toggleItemFormEditing(false);
        })
    }

    addListItem(category) {
        this.setlistItemDetails({ item: '',
                                  category: category });
        this.listItemDetailsSection.style.display = "block";
        this.toggleItemFormEditing(true);
    }

    editListItem() {
        var listItemId = this.getlistItemId();

        this.store.get(this.getlistItemId()).then(item => {
            this.setlistItemDetails(item);
            this.toggleItemFormEditing(true);
        });
    }

    saveListItem() {
        var item = this.getlistItemDetails();
        // console.log("Saving incart=", item.incart);
        this.store.save(item).then(() => {
            this.setlistItemDetails({});
            this.toggleItemFormEditing(false);
            this.refresh();
        });
        this.listItemDetailsSection.style.display = "none";
    }

    removeListItem() {
        if(!window.confirm(ITEM_REMOVE_CONFIRM))
            return;

        var listItemId = this.getlistItemId();

        this.store.remove(listItemId).then(() => {
            this.setlistItemDetails({});
            this.toggleItemFormEditing(false);
            this.refresh();
        });
        this.listItemDetailsSection.style.display = "none";
    }

    cancelEdit() {
        this.setlistItemDetails({});
        this.toggleItemFormEditing(false);
        this.listItemDetailsSection.style.display = "none";
    }

    getlistItemDetails() {
        return {
            _id: this.getlistItemId(),
            item: this.itemnameField.value,
            category: this.categoryField.value,
            incart: (this.incartField.value == "true")
        };
    }

    getlistItemId() {
        return this.listItemIdField.value;
    }

    setlistItemDetails(listItemDetails) {
        this.listItemIdField.value = listItemDetails._id || '';
        this.itemnameField.value = listItemDetails.item || '';
        this.categoryField.value = listItemDetails.category || '';
        this.incartField.value = listItemDetails.incart || false;
    }

    toggleItemFormEditing(isEditing) {
        var isItemSelected = !this.getlistItemId();

        this.toggleFade(this.listItemDetailsForm, !isEditing);

        this.toggleElement(this.editListItemButton, !isEditing && !isItemSelected);
        this.toggleElement(this.removeListItemButton, !isEditing && !isItemSelected);

        this.toggleElement(this.addListItemButton, !isEditing);
        this.toggleElement(this.saveListItemButton, isEditing);
        this.toggleElement(this.cancelEditButton, true);

        this.toggleDisabled(this.itemnameField, !isEditing);
        this.toggleDisabled(this.categoryField, !isEditing);
        this.toggleDisabled(this.incartField, !isEditing);

        this.itemnameField.focus();
        this.itemnameField.setSelectionRange(0, this.itemnameField.value.length);
    }

    toggleElement(element, isShown) {
        element.style.display = isShown ? 'block' : 'none';
    }

    toggleFade(element, isFade) {
        element.style.opacity = isFade ? .5 : 1;
    }

    toggleDisabled(element, isDisabled) {
        if(isDisabled) {
            element.setAttribute('disabled', '');
        } else {
            element.removeAttribute('disabled');
        }
    }
}

window.ShoppingBase = ShoppingBase;
