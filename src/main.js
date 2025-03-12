import "./assets/styles/main.css";

import Aura from "@primeuix/themes/aura";
import Button from "primevue/button";
import PrimeVue from "primevue/config";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import SelectButton from "primevue/selectbutton";
import StyleClass from "primevue/styleclass";
import ToggleSwitch from "primevue/toggleswitch";
import Toolbar from "primevue/toolbar";
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import { createApp } from "vue";
import router from './router';
import App from "./App.vue";
import {createPinia} from "pinia";
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "primevue";

const app = createApp(App);
const pinia = createPinia()


app.use(router);
app.use(PrimeVue, {
	theme: {
		preset: Aura,
		options: {
			darkModeSelector: ".p-dark",
		},
	},
});
app.use(ToastService);
app.use(pinia)


app.component("Button", Button);
app.component("InputText", InputText);
app.component("FloatLabel", FloatLabel);
app.component("Toolbar", Toolbar);
app.component("ToggleSwitch", ToggleSwitch);
app.component("SelectButton", SelectButton);
app.component('Toast', Toast);
app.component("Tabs", Tabs);
app.component("Tab", Tab);
app.component("TabList", TabList);
app.component("TabPanels", TabPanels);
app.component("TabPanel", TabPanel);
app.directive("styleclass", StyleClass);



app.mount("#app");
