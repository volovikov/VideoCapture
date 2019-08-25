/**
 * Vue component collection
 * @author: vvolovikov
 *
 * // form example usage:
 *
 * <main-form ref="main-form">
 *   <main-form-field>
 *     <main-form-label>Select label</main-form-label>
 *     <main-form-select @select="onSelectHandler" name="selectInputName" :list="selectValueArray"></main-form-select>
 *   </main-form-field>
 *   <main-form-field>
 *     <main-form-label>Input label</main-form-label>
 *     <main-form-input name="inputName" mandatory="mandatory"></main-form-input>
 *   </main-form-field>
 *   <main-form-field>
 *     <main-form-label>Textarea label</main-form-label>
 *     <main-form-textareat name="textareaName"></main-form-textarea>
 *   </main-form-field>
 *   <main-button-group>
 *     main-button selected="selected" @click="onClickPrimaryBtn">Основная</main-button>
 *    <main-button @click="onClickSecondaryBtn">Дополнительная</main-button>
 *   </main-button-group>
 * </main-form>
 *
 *
 * // tab example usage:
 *
 * <main-tab>
 *   <main-tab-item title="tab1">
 *     <main-form>
 *       .....
 *     </main-form>
 *   </main-tab-item>
 * </main-tab>
 *
 * new Vue({
 *    onClickPrimaryBtn() {
 *      var f = this.$refs['main-form'];
 *      console.log(f.getFormErrors());
 *      console.log(f.getFormValue());
 *    }
 * });
 */

/**
 * General form event mainEventBus
 * @event focus-on
 */
var mainEventBus = new Vue();

/**
 * Example usage:
 * 
 * <main-row>
 *  <main-col>
 *      ..
 *  </main-col>
 * </main-row>
 */
Vue.component('main-row', {
    methods: {
        getChildrenCount() {
            return this.$children.length;
        },
        getFirstChildrenUid() {
            return this.$children[0]._uid;
        },
        getLastChildrenUid() {
            return this.$children[this.$children.length-1]._uid;
        }
    },
    template: '<div class="Row" style="clear:both"><slot></slot></div>'
});
/**
 * Этот компонент кладеться сразу после main-row
 * main-col использует методы из main-row
 * для того, чтобы высчитать размер колонок. 
 * Если внутри main-row три main-col 
 * То размер каждой будет высчетан как 50%
 * 
 * example:
 * 
 * <main-row>
 *  <main-col>
 *      ...
 *  </main-col>
 *  <main-col>
 *      ...
 *  </main-col>
 *  <main-col>
 *      ...
 *  </main-col>
 * </mcin-row>
 */
Vue.component('main-col', {
    data: function() {
        return {
            width: 0,
            isFirst: false,
            isLast: false
        }
    },
    mounted: function() {
        this.width = 100 / this.$parent.getChildrenCount();
        this.isFirst = this.$parent.getFirstChildrenUid() == this._uid ? true : false;
        this.isLast = this.$parent.getLastChildrenUid() == this._uid ? true : false;
    },
    template: `<div class="Col" style="float:left;" :style="{width:width+'%'}" :class="{First:isFirst, Last:isLast}"><slot></slot></div>` 
});
Vue.component('main-form', {
    props: {

    },
    data: function() {
        return {
            mainType: 'form'
        }
    },
    methods: {
        setFocusOff: function() {
            that.$children.forEach(function(f) {
                f.setFocusOff();
            });
        },
        getFormErrors: function() {
            var that = this,
                result = [];

            this.$children.forEach(function(f) {
                if (typeof f.isValid != 'undefined') {
                    if (!f.isValid()) {
                        result.push({
                            key: f.getKey(),
                            value: f.getValue(),
                            isValid: f.isValid(),
                            field: f
                        });
                    }
                }
            });
            return result;
        },
        getFormValue: function() {
            var result = {};

            this.$children.forEach(function(f) {
                if (typeof f.getKey != 'undefined' && typeof f.getValue != 'undefined') {
                    result[f.getKey()] = f.getValue()
                }
            });
            return result;
        },
        reset: function() {
            this.$children.forEach(function(f) {
                if (typeof f.reset != 'undefined') {
                    f.reset();
                }
            });
        }
    },
    template: '<div class="Form"><slot></slot></div>'
});
Vue.component('main-form-field', {    
    data: function() {
        return {
            isDisabled: false
        }
    },
    methods: {
        setDisableOn: function() {
            this.isDisabled = true;
        },
        setDisableOff: function() {
            this.isDisabled = false;
        }
    },
    template: '<div class="Row"><div class="Field" :class="{Disabled:isDisabled}"><slot></slot></div></div>'
});
Vue.component('main-form-label', {
    data: function() {
        return {
            
        }
    },
    template: '<div class="Label"><slot></slot></div>'
});
Vue.component('main-form-input', {
    props: {
        active: {
            type: String, // active="active"
            default: ''
        },
        error: {
            type: String, // error="error"
            default: ''
        },
        type: {
            type: String,
            default: 'text'
        },
        name: {
            type: String,
            default: 'text'
        },
        mandatory: {
            type: String,
            default: ''
        },
        value: {
            type: String,
            default: ''
        },
        readonly: {
            rype: String,
            default: ''
        }
    },
    data: function() {        
        return {
            mainValue: this.value,
            mainKey: this.name,
            hasError: this.error,
            hasActive: this.active,
            mainType: 'input'
        }
    },    
    mounted: function () {
        var that = this ;

         mainEventBus.$on('focus-on', function(el) {
            if (that._uid != el._uid) {
                that.setFocusOff();
            }
        });
    },    
    methods: {
        reset: function() {
            this.mainValue = '';
        },
        setErrorOn: function() {
            this.hasError = true;
        },
        setErrorOff: function() {
            this.hasError = false;
        },
        isValid: function() {
            if (this.isMandatory()) {
                if (this.getValue() == '') {
                    return false;
                } else {
                    return true;
                }
            } else {
                return true;
            }
        },
        isReadonly: function() {
            return this.readonly == 'readonly';
        },
        getKey: function() {
            return this.mainKey;
        },
        getValue: function() {
            return this.mainValue;
        },
        isMandatory: function() {
            return this.mandatory === 'mandatory';
        },
        setFocusOn: function() {
            this.hasActive = true;
        },
        setFocusOff: function() {
            this.hasActive = false;
        },
        onClick: function() {
            this.setFocusOn();
            mainEventBus.$emit('focus-on', this);
            this.$emit('focus-on', this);
        },
        handleInput: function(v) {
            this.$emit('input', v);
        }
    },
    template: '<div v-on:click="onClick" class="Text" :class="{\'Error\':hasError, \'Focus\':hasActive, \'Readonly\':isReadonly()}"><input :readonly="isReadonly()" :type="type" :name="name" :value="value" @input="handleInput($event.target.value)"></div>'
});
Vue.component('main-form-select', {
    props: {
        name: {
            type: String,
            default: ''
        },
        active: {
            type: String, // active="active"
            default: ''
        },
        error: {
            type: String, // error="error"
            default: ''
        },
        list: Array
    },
    computed: {
        mainList: function() {
            return this.list;
        },
        mainKey: function() {
            var key;

            this.list.forEach(function(r) {
                if (typeof r.selected != 'undefined') {
                    key = r.key
                }
            });
            if (typeof key == 'undefined' && this.list.length > 0) {
                return this.list[0].key;
            }
            return key;
        },
        mainValue: function() {
            var value;

            this.list.forEach(function(r) {
                if (typeof r.selected != 'undefined') {
                    value = r.value
                }
            });
            if (typeof value == 'undefined' && this.list.length > 0) {
                return this.list[0].value;
            }
            return value;
        }
    },
    watch: {
        mainKey: function(v) {
            this.selectedKey = this.mainKey;
        },
        mainValue: function(v) {
            this.selectedValue = this.mainValue;
        },
    },
    mounted: function() {
        var that = this ;

         mainEventBus.$on('focus-on', function(el) {
            if (that._uid != el._uid) {
                that.setFocusOff();
                that.close();
            }
        });
        this.selectedKey = this.mainKey;
        this.selectedValue = this.mainValue;
    },
    data: function() {
        return {
            mainName: this.name,
            mainWidth: '',
            mainType: 'input',
            selectedKey: null,
            selectedValue: null,
            hasError: this.error,
            hasActive: this.active,
            isComponentOpen: false,
            isDisabled: false
        }
    },
    updated: function() {
        this.mainWidth = (this.$el.clientWidth-2) + 'px';
    },
    methods: {
        setDisableOn: function() {
            this.isDisabled = true;
        },
        setDisableOff: function() {
            this.isDisabled = false;
        },
        setErrorOn: function() {

        },
        setErrorOff: function() {

        },
        isValid: function() {
            return true;
        },
        isMandatory: function() {
            return false;
        },
        getKey: function() {
            return this.name;
        },
        getValue: function() {
            return this.selectedKey;
        },
        getText: function() {
            return this.selectedValue;
        },
        setFocusOn: function() {
            this.hasActive = true;
        },
        setFocusOff: function() {
            this.hasActive = false;

            if (this.isComponentOpen) {
                this.close();
            }
        },
        open: function() {
            if (!this.isDisabled) {
                this.isComponentOpen = true;
            }            
        },
        close: function() {
            if (!this.isDisabled) {
                this.isComponentOpen = false;
            }            
        },
        toggle: function() {
            if (this.isComponentOpen) {
                this.setFocusOff();
                this.close();
            } else {
                this.setFocusOn();
                this.open();
            }
        },
        onClick: function() {
            this.toggle();
            mainEventBus.$emit('focus-on', this);
            mainEventBus.$emit('expand-on', this);
            this.$parent.$emit('focus-on', this);
        },
        onSelect: function(key, value) {
            this.selectedKey = key;
            this.selectedValue = value;
            this.toggle();
            this.$emit('select', {
                key: key,
                value: value
            });
        }
    },
    template: `<div class="Select" :class="{\'Error\':hasError, \'Focus\':hasActive}" v-on:click="onClick">
            <div class="Area">{{selectedValue}}</div>
            <div class="Popup">
                <div class="Options" :class="{\'Active\':isComponentOpen}" style="margin-top:-1px; margin-left:-10px" :style="{width:mainWidth}">
                    <div class="Item"  v-on:click.stop="onSelect(item.key, item.value)" v-for="item in mainList" :key="item.key">{{item.value}}</div>
                </div>
            </div>
        </div>`
});
Vue.component('main-form-textarea', {
    props: {
        active: {
            type: String, // active="active"
            default: ''
        },
        error: {
            type: String, // error="error"
            default: ''
        },
        name: {
            type: String,
            default: ''
        },
        mandatory: {
            type: String,
            default: ''
        },
        value: {
            type: String,
            default: ''
        }
    },
    data: function() {
        return {
            mainValue: this.value,
            mainKey: this.name,
            hasError: this.error,
            hasActive: this.active
        };
    },
    methods: {
        reset: function() {
            this.mainValue = '';
        },
        setErrorOn: function() {
            this.hasError = true;
        },
        setErrorOff: function() {
            this.hasError = false;
        },
        isValid: function() {
            if (this.isMandatory()) {
                if (this.getValue() == '') {
                    return false;
                } else {
                    return true;
                }
            } else {
                return true;
            }
        },
        isMandatory: function() {
            return this.mandatory == 'mandatory';
        },
        getKey: function() {
            return this.mainKey;
        },
        getValue: function() {
            return this.mainValue;
        },
        setFocusOn: function() {
            this.hasActive = true;
        },
        setFocusOff: function() {
            this.hasActive = false;
        },
        onClick: function() {
            this.setFocusOn();
            mainEventBus.$emit('focus-on', this);
            this.$emit('focus-on', this);
        }
    },
    template: `<div v-on:click="onClick" class="TextArea" :class="{\'Error\':hasError, \'Focus\':hasActive}">
                <textarea :name="name" v-model="mainValue"></textarea>
            </div>`
});
Vue.component('main-form-checkbox', {
    props: {
        name: {
            type: String,
            default: ''
        },
        value: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        isChecked: function() {
           return this.mainValue === true;
       }
    },
    data: function() {
        return {
            mainValue: this.value,
            mainName: this.name
        }
    },
    watch: {
        mainValue(v) {
            console.log(v);
        }
    },
    methods: {
        getKey: function() {
            return this.mainName;
        },
        getValue: function() {
            return this.mainValue;
        },
        onClick: function() {
            this.mainValue = !this.mainValue;
            mainEventBus.$emit('focus-on', this);
            this.$emit('input', this.mainValue);
        }
    },
    template: `<div class="Checkbox" :class="{Selected:isChecked}" @click="onClick" :name="name" >
                 <div class="Label"><slot></slot></div>
               </div>`
})
Vue.component('main-tab', {
    props: {
        bordered: {
            type: String,
            default: ''
        }
    },
    watch: {
        activeSectionIndex: function(v) {
            this.$children.forEach(function(c, index) {
                if (v == index) {
                    c.enable();
                } else {
                    c.disable();
                }
            });
        }
    },
    mounted: function() {
        var that = this;

        this.$children.forEach(function(c, index) {
            that.titles.push(c.$props.title);

            if (index == that.activeSectionIndex) {
                c.enable();
            } else {
                c.disable();
            }
        });
    },
    data: function() {
        return {
            hasBorder: this.bordered == 'bordered',
            activeSectionIndex: 0,
            titles: []
        }
    },
    methods: {
        onClick: function(index) {
            if (index == this.activeSectionIndex) {
                return;
            } else {
                this.activeSectionIndex = index;
            }
            this.$emit('click', index);
        }
    },
    template: '<div class="TabPanel">'+
                '<div class="Header">'+
                    '<div v-on:click.stop="onClick(index)" v-for="(title,index) in titles" class="Section" :class="[index == activeSectionIndex ? \'Active\' : \'\', ]">{{title}}'+
                    '</div>'+
                '</div>'+
                '<div class="Body" :class="[hasBorder ? \'Box\' : \'\']" :style="activeSectionIndex == 0 ? \'border-radius: 0 6px 6px 6px\' : \'\'">'+
                    '<slot></slot>'+
                '</div>'+
            '</div>'
});
Vue.component('main-tab-item', {
    props: {
        title: String,
        active: {
            type: String,
            default: ''
        },
    },
    data: function() {
        return {
            isActive: this.active == 'active',
        }
    },
    methods: {
        enable: function() {
            this.isActive = true;
        },
        disable: function() {
            this.isActive = false;
        },
    },
    template: '<div class="Section" :class="[isActive ? \'Active\' : \'\']"><slot></slot></div>'
});
Vue.component('main-table', {
    props: {
        columns: Array,
        data: Array
    },
    computed: {
        mainColumns: function() {
            return this.columns;
        },
        mainData: function() {
            return this.data;
        }
    },
    watch: {

    },
    mounted: function() {

    },
    data: function() {
        return {
            selectedRowIndex: null
        }
    },
    methods: {
        resetSelected() {
            this.selectedRowIndex = null;
        },
        onClickRow(row, index) {
            this.selectedRowIndex = index;
            this.$emit('row-click', row);
        }
    },
    template: `<div class="Table">
            <table>
                <tr>
                    <th v-for="column in mainColumns">{{column}}</th>
                </tr>
                <tr v-for="(row,index) in mainData" v-on:click="onClickRow(row, index)" :class="[index==selectedRowIndex ? 'Selected' : '']">
                    <td v-html="td" v-for="td in row"></td>
                </tr>
            </table>
        </div>`
});
Vue.component('main-button-group', {
    template: '<div class="Buttons" style="margin-top: 2em"><slot></slot></div>'
});
Vue.component('main-button', {
    data: function() {
        return {
            mainType: 'button'
        }
    },
    props: {
        selected: {
            type: String,
            default: ''
        },
        click: {
            type: Function
        }
    },
    template: '<div v-on:click.stop="click" class="Button" :class="{\'Selected\':selected}"><slot></slot></div>'
});
