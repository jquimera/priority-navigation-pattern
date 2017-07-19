/**
 *
 */

class PriorityNavigationPattern {
  constructor(menuElement, options = {}) {
    this.navWrapper = document.querySelector('[ds-menu=' + menuElement + ']');
    if (this.navWrapper) {
      this.visibleMenu = this.navWrapper.querySelector('[ds-visible-menu]');
      this.visibleMenuList = this.visibleMenu.querySelector('[ds-visible-menu-list]');
      this.hiddenMenu = this.navWrapper.querySelector('[ds-hidden-menu]');
      this.hiddenMenuList = this.hiddenMenu.querySelector('[ds-hidden-menu-list]');
      this.button = this.visibleMenu.querySelector('[ds-display-more-toggle]');

      this._setup();
      this.options =  { ...PriorityNavigationPattern.defaults, ...options, ...this.dataOptions };
      console.log(this.options);
      this._init();
    }

  }
  /**
   * Initializes priority navigation menu.
   * @private
   */
  _init() {
    window.addEventListener('load', this._onLoad.bind(this), true);
    window.addEventListener('resize', this._onResize.bind(this), true);
    window.addEventListener('orientationchange', this._onOrientationChange.bind(this), true);
    this.button.addEventListener('click', this.toggleHiddenMenu.bind(this), true);
  }

  _onLoad() {
    let _this = this;
    new Promise(function () {
      _this.options.onLoad();
    }).then(this.update())
      .then(this.options.onInit());
  }

  _onResize() {
    this.update();
    this.closeEmptyHiddenMenu();
    this.options.onResize();
    this.isMinItems();
  }

  _onOrientationChange() {
    this.refresh();
  }

  hideButton() {
    this.button.classList.remove('activeButton');
  }

  showButton() {
    this.button.classList.add('activeButton');
  }

  showHiddenMenu() {
    this.hiddenMenu.classList.add('isActive');
    this.options.onHiddenMenuOpen();
  }

  hideHiddenMenu() {
    this.hiddenMenu.classList.remove('isActive');
    this.options.onHiddenMenuClose();
  }

  closeHiddenMenu() {
    if (this.hiddenMenu.classList.contains('isActive')) {
      this.button.children[0].click();
    }
  }

  closeEmptyHiddenMenu() {
    if (this.newMenu < 1) {
      this.hideButton();
      this.closeHiddenMenu();
    }
  }

  visibleMenuWrapperLength() {
    let menuLength = '';
    if (this.isVertical()) {
      menuLength = this.visibleMenu.offsetHeight - this.visibleMenuBottom.offsetHeight - 1;
    }  else {
      menuLength = this.visibleMenu.offsetWidth;
    }

    const buttonLength = (this.isVertical()) ? this.button.offsetHeight : this.button.offsetWidth;
    return this.button.classList.contains('active') ? menuLength - buttonLength : menuLength;
  }

  menuVisibleLength() {
    return (this.isVertical()) ?
      this.visibleMenuList.offsetHeight : this.visibleMenuList.offsetWidth;
  }

  /**
   * Fires when visible menu length is bigger then wrapper around.
   * @fires pushItem
   * @fires returnItem
   * @fires hideButton
   * @fires showButton
   * @fires update
   * @fires isBreakpoint
   * @fires isMinItems
   * @function
   */
  update() {
    if (this.menuVisibleLength() > this.visibleMenuWrapperLength()) {
      this.pushItem(this.options.direction);
    } else {
      if (this.visibleMenuWrapperLength() > this.newMenu[this.newMenu.length - 1]) {
        this.returnItem();
      }

      if (this.newMenu.length < 1) {
        this.hideButton();
      }
    }

    if (this.newMenu.length > 0) {
      this.showButton();
    }

    if (this.menuVisibleLength() > this.visibleMenuWrapperLength()) {
      this.update();
    }
  }

  refresh() {
    if (this.visibleMenuWrapperLength() > this.menuVisibleLength() && this.newMenu.length >= 1) {
      this.returnItem();
      this.refresh();
    }
    
    this.closeEmptyHiddenMenu();
  }

  pushItem() {
    this.newMenu.push(this.menuVisibleLength());
    let itemToMove = this.visibleMenuList.lastElementChild.previousElementSibling;
    if (this.hiddenMenuList.firstChild) {
      this.hiddenMenuList.insertBefore(itemToMove, this.hiddenMenuList.firstChild);
    } else {
      this.hiddenMenuList.appendChild(itemToMove);
    }
  }

  // Return items from hidden menu into the main menu in correct order
  returnItem() {
    const itemToMove = this.hiddenMenuList.firstChild;
    this.visibleMenuList.insertBefore(itemToMove, this.button);
    this.newMenu.pop();
    this.closeEmptyHiddenMenu();
  }

  /**
   * Check if menu is vertical or not
   * @function
   */
  isVertical() {
    return (this.options.direction === 'vertical');
  }

  /**
   * Toggle class on hiddem menu
   * @function
   */
  toggleHiddenMenu() {
    this.hiddenMenu.classList.contains('isActive') ? this.hideHiddenMenu() : this.showHiddenMenu();
    this.options.onHiddenMenuToggle();
  }

  /**
   * Return booleans if there is more or less items in menu than in minimum items
   * @function
   */
  isMinItems() {
    console.log(this.visibleMenuList.childElementCount - this.displayButtonCount <= this.options.minItems);
    return this.visibleMenuList.childElementCount - this.displayButtonCount <= this.options.minItems;
  }

  /**
   * Return booleans if breakpoints is smaller or bigger than set up
   * @function
   */
  isBreakpoint() {
    return this.options.breakpoint < window.innerWidth;
  }

  _destroy() {
    window.removeEventListener('resize', this._onResize);
  }

  _setup() {
    this.newMenu = [];
    this.displayButtonCount = 1;
    this.dataOptions = {};
    if (this.navWrapper.getAttribute('data-direction')) {
      this.dataOptions.direction = this.navWrapper.getAttribute('data-direction');
    }

    if (this.navWrapper.getAttribute('data-start-breakpoint')) {
      this.dataOptions.breakpoint = this.navWrapper.getAttribute('data-start-breakpoint');
    }

    if (this.navWrapper.getAttribute('data-min-items')) {
      this.dataOptions.minItems = this.navWrapper.getAttribute('data-min-items');
    }
  }

}

PriorityNavigationPattern.defaults = {
  /**
   *
   * @option
   * @type { number }
   * @default: 300
   */
  breakpoint: 300,
  /**
   * Setting menu breakpoints.
   * @option
   * @type { object }
   * @default: 'List of default breakpoints'
   */
  breakpoints: {
    small: 0,
    medium: 640,
    large: 1024,
    xlarge: 1200,
    xxlarge: 1440,
  },
  /**
   * Setting menu direction. Can be horizonal or vertical.
   * @option
   * @type { string }
   * @default: 'horizontal'
   */
  direction: 'horizontal',
  /**
   * Amount of items left in visible menu.
   * @option
   * @type { number }
   * @default: 1
   */
  minItems: 1,
  /**
   * Methods that is called before script is initialized.
   * @option
   * @type { method }
   * @default: null
   */
  onLoad: function () {
  },
  /**
   * Methods that is called after script is initialized.
   * @option
   * @type { method }
   * @default: null
   */
  onInit: function () {
  },
  /**
   * Methods that is called when hidden menu is closed.
   * @option
   * @type { method }
   * @default: null
   */
  onHiddenMenuClose: function () {
  },
  /**
   * Methods that is called when hidden menu is closed.
   * @option
   * @type { method }
   * @default: null
   */
  onHiddenMenuOpen: function () {
  },
  /**
   * Methods that is called when hidden menu is triggered.
   * @option
   * @type { method }
   * @default: null
   */
  onHiddenMenuToggle: function () {
  },
  /**
   * Methods that is called when window is resized.
   * @option
   * @type { method }
   * @default: null
   */
  onResize: function () {
  },
  /**
   * Methods that is called when window is resized.
   * @option
   * @type { method }
   * @default: null
   */
  onItemMove: function () {
  },
};

const mainMenu = new PriorityNavigationPattern('main');
