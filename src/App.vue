<template>
  <v-app app>
    <v-app-bar ref="appBar" id="app-bar" color="blue-grey lighten-4" prominent elevate-on-scroll shrink-on-scroll fixed app>
      <v-container class="d-flex align-end full-height">
        <router-link
          :to="{ path: `/` }"
          class="logo"
        >
          <img :src="isAppBarExtended ? require('@/assets/img/CZN_Logo.png') : require('@/assets/img/czcnet_logo_circle.png')"
            alt="Critical Zone Network logo"
          />
        </router-link>
        <div class="spacer"></div>
        <v-card class="nav-items has-space-right d-flex" :elevation="2" v-if="!$vuetify.breakpoint.mdAndDown">
          <v-btn id="navbar-nav-home" to="/" :elevation="0" active-class="is-active">Home</v-btn>
          <v-btn :id="`navbar-nav-${path.label.replaceAll(/[\/\s]/g, ``)}`" v-for="path of paths" :key="path.to" :to="path.to" :elevation="0" active-class="is-active">{{ path.label }}</v-btn>
        </v-card>

        <template v-if="!$vuetify.breakpoint.mdAndDown">
          <v-btn id="navbar-login" v-if="!isLoggedIn" @click="openLogInDialog()" rounded>Log In</v-btn>
          <v-btn id="navbar-logout" v-else rounded @click="logOut()"><v-icon class="mr-2">mdi-logout</v-icon>Log Out</v-btn>
        </template>

        <v-app-bar-nav-icon @click.stop="showMobileNavigation = true" v-if="$vuetify.breakpoint.mdAndDown" />
      </v-container>
    </v-app-bar>

    <v-main app>
      <v-container id="main-container">
        <v-sheet :elevation="$route.meta.hideMainSheet ? 0 : 2">
          <router-view v-if="!isLoading" name="content" />
        </v-sheet>
      </v-container>
    </v-main>

    <v-footer>
      <router-view name="footer" />
    </v-footer>

    <v-navigation-drawer class="mobile-nav-items" v-model="showMobileNavigation" temporary app>
      <v-list nav dense class="nav-items">
        <v-list-item-group class="text-body-1">
          <v-list-item id="drawer-nav-home" @click="showMobileNavigation = false" to="/" active-class="is-active">
            <v-icon class="mr-2">mdi-home</v-icon>
            <span>Home</span>
          </v-list-item>

          <v-list-item
            v-for="path of paths"
            :id="`drawer-nav-${path.label.replaceAll(/[\/\s]/g, ``)}`"
            :key="path.to"
            :to="path.to"
            @click="showMobileNavigation = false"
            active-class="is-active"
          >
            <v-icon class="mr-2">{{ path.icon }}</v-icon>
            <span >{{ path.label }}</span>
          </v-list-item>
        </v-list-item-group>

        <v-divider class="my-4"></v-divider>

        <v-list-item-group class="text-body-1">
          <v-list-item id="drawer-nav-login" v-if="!isLoggedIn" @click="openLogInDialog(); showMobileNavigation = false">
            <v-icon class="mr-2">mdi-login</v-icon>
            <span>Log In</span>
          </v-list-item>

          <v-list-item id="drawer-nav-logout" v-else @click="logOut()">
            <v-icon class="mr-2">mdi-logout</v-icon>
            <span>Log Out</span>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-snackbar
      v-model="snackbar.isActive"
      :timeout="snackbar.isInfinite ? -1 : snackbar.duration"
      :color="snackbarColors[snackbar.type].snackbar"
    >
      <span>{{ snackbar.message }}</span>

      <template v-slot:action="{ attrs }">
        <v-btn
          @click="snackbar.isActive = false"
          v-bind="attrs"
          :color="snackbarColors[snackbar.type].actionButton"
          >Dismiss</v-btn
        >
      </template>
    </v-snackbar>

    <v-dialog
      :id="`dialog-` + dialog.title.replaceAll(` `, ``)"
      v-model="dialog.isActive"
      persistent
      width="500"
    >
      <v-card>
        <v-card-title>{{ dialog.title }}</v-card-title>
        <v-card-text class="text-body-1">{{ dialog.content }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="dialog-cancel"
            @click="
              dialog.isActive = false;
              dialog.onCancel();
            "
            color="green darken-1"
            text
          >
            {{ dialog.cancelText }}
          </v-btn>

          <v-btn
            v-if="dialog.onSecondaryAction"
            @click="
              dialog.isActive = false;
              dialog.onSecondaryAction();
            "
            color="green darken-1"
            text
          >
            {{ dialog.secondaryActionText }}
          </v-btn>

          <v-btn
            class="dialog-confirm"
            @click="
              dialog.isActive = false;
              dialog.onConfirm();
            "
            color="green darken-1"
            text
          >
            {{ dialog.confirmText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="logInDialog.isActive" width="500">
      <cz-login @cancel="logInDialog.isActive = false" @logged-in="logInDialog.onLoggedIn"></cz-login>
    </v-dialog>

    <v-dialog v-model="authorizeDialog.isActive" width="500">
      <cz-authorize @authorized="authorizeDialog.onAuthorized" :repo="authorizeDialog.repo"></cz-authorize>
    </v-dialog>
    <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css" rel="stylesheet">
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { setupRouteGuards } from "./router"
import { Subscription } from "rxjs"
import { DEFAULT_TOAST_DURATION } from "./constants"
import { RawLocation } from "vue-router"
import { EnumRepositoryKeys } from "./components/submissions/types"
import CzNotification, { IDialog, IToast } from "./models/notifications.model"
import CzFooter from "@/components/base/cz.footer.vue"
import CzLogin from "@/components/account/cz.login.vue"
import CzAuthorize from "@/components/authorize/cz.authorize.vue"
import User from "@/models/user.model"
import Zenodo from "@/models/zenodo.model"
import HydroShare from "./models/hydroshare.model"
import Submission from "./models/submission.model"
import Repository from "./models/repository.model"
import External from "./models/external.model"
import EarthChem from "./models/earthchem.model"

const INITIAL_DIALOG = {
  title: "",
  content: "",
  confirmText: "",
  cancelText: "",
  isActive: false,
  onConfirm: () => {},
  onCancel: () => {},
}

const INITIAL_SNACKBAR =  {
  message: '',
  duration: DEFAULT_TOAST_DURATION,
  position: 'center' as ('center' | 'left' | undefined),
  type: 'default' as ('default' | 'success' | 'error' | 'info'),
  isActive: false,
  isInfinite: false,
  // isPersistent: false,
}

@Component({
  name: "app",
  components: { CzFooter, CzLogin, CzAuthorize },
})
export default class App extends Vue {
  protected isLoading = true
  protected onToast!: Subscription
  protected onOpenDialog!: Subscription
  protected onOpenLogInDialog!: Subscription
  protected onOpenAuthorizeDialog!: Subscription
  protected showMobileNavigation = false
  protected loggedInSubject = new Subscription()
  protected authorizedSubject = new Subscription()
  protected isAppBarExtended = true
  protected snackbarColors = {
    success: { snackbar: 'primary', actionButton: 'primary darken-2' },
    error: { snackbar: 'error darken-2', actionButton: 'error darken-3' },
    info: { snackbar: 'primary', actionButton: 'primary darken-2' },
    default: { snackbar: undefined, actionButton: undefined },
  }
  protected snackbar: IToast & { isActive: boolean; isInfinite: boolean } = INITIAL_SNACKBAR
  protected dialog: IDialog & { isActive: boolean } = INITIAL_DIALOG
  protected logInDialog: any & { isActive: boolean } = {
    isActive: false,
    onLoggedIn: () => {},
    onCancel: () => {},
  }
  protected authorizeDialog: any & { isActive: boolean } = {
    isActive: false,
    repo: '',
    onAuthorized: () => {},
    onCancel: () => {},
  }
  protected paths = [
    { to: "/submissions", label: "My Submissions", icon: "mdi-bookmark-multiple" },
    { to: "/resources", label: "Resources", icon: "mdi-library" },
    { to: "/submit", label: "Submit Data", icon: "mdi-book-plus" },
    { to: "/about", label: "About", icon: "mdi-help" },
    { to: "/contact", label: "Contact", icon: "mdi-book-open-blank-variant" },
  ]

  protected get isLoggedIn() {
    return User.$state.isLoggedIn
  }

  mounted() {
    this.$watch('$refs.appBar.computedHeight', (newValue, oldValue) => {
      this.isAppBarExtended = newValue > oldValue
    })
  }

  protected openLogInDialog() {
    User.openLogInDialog()
  }

  protected logOut() {
    CzNotification.openDialog({
      title: "Log out?",
      content: "Are you sure you want to log out?",
      confirmText: "Log Out",
      cancelText: "Cancel",
      onConfirm: () => {
        User.logOut();
      },
    })
  }

  async created() {
    document.title = "CZ Hub"

    if (this.$route.name !== "submissions") {
      // Only load submissions on app start if outside submissions page. Otherwise the submissions page will load them on 'created' lifecyecle hook
      Submission.fetchSubmissions()
    }

    this.onToast = CzNotification.toast$.subscribe((toast: IToast) => {
      this.snackbar = { ...this.snackbar, ...toast }
      this.snackbar.isActive = true
    })

    this.onOpenDialog = CzNotification.dialog$.subscribe((dialog: IDialog) => {
      this.dialog = { ...INITIAL_DIALOG, ...dialog }
      this.dialog.isActive = true
    })

    this.onOpenLogInDialog = User.logInDialog$.subscribe((redirectTo: RawLocation | undefined) => {
      this.logInDialog.isActive = true

      this.logInDialog.onLoggedIn = () => {
        if (redirectTo) {
          this.$router.push(redirectTo)
        }
        this.logInDialog.isActive = false
      }
    })

    this.onOpenAuthorizeDialog = Repository.authorizeDialog$.subscribe((params: { repository: string, redirectTo?: RawLocation | undefined }) => {
      this.authorizeDialog.repo = params.repository
      this.authorizeDialog.isActive = true
      this.authorizeDialog.onAuthorized = async () => {
        if (params.redirectTo) {
          if (params.repository === EnumRepositoryKeys.hydroshare) {
            await HydroShare.init()
          }
          else if (params.repository === EnumRepositoryKeys.zenodo) {
            await Zenodo.init()
          }
          else if (params.repository === EnumRepositoryKeys.earthchem) {
            await EarthChem.init()
          }
          this.$router.push(params.redirectTo)
        }
        this.authorizeDialog.isActive = false
      }
    })

    // Check for Authorization cookie instead.
    // const isAuthorized = this.$cookies.get('Authorization')

    // TODO: if the user is not logged in in the server, the client auth cookie needs to be deleted
    // Reproducible if the server is restarted

    // if (isAuthorized && !User.$state.isLoggedIn) {
    await User.checkAuthorization()
    // }

    if (User.$state.isLoggedIn) {
      await this._initRepositories()
    }
    else {
      this.loggedInSubject = User.loggedIn$.subscribe(async () => {
        await this._initRepositories()
      })
    }

    // this.authorizedSubject = Repository.authorized$.subscribe(async (repository: string) => {
    //   if (repository === EnumRepositoryKeys.hydroshare) {
    //     await HydroShare.init()
    //   }
    //   else if (repository === EnumRepositoryKeys.zenodo) {
    //     await Zenodo.init()
    //   }
    // })

    // Guards are setup after checking authorization and loading access tokens
    // because they depend on user logged in status
    setupRouteGuards()

    this.isLoading = false;
  }

  private _initRepositories() {
    return Promise.all([
      HydroShare.init(),
      EarthChem.init(),
      Zenodo.init(),
      External.init()
    ])
  }

  beforeDestroy() {
    // Good practice
    this.onToast.unsubscribe()
    this.onOpenDialog.unsubscribe()
    this.onOpenLogInDialog.unsubscribe()
    this.onOpenAuthorizeDialog.unsubscribe()
    this.loggedInSubject.unsubscribe()
  }
}
</script>

<style lang="scss" scoped>
.logo {
  height: 100%;
  cursor: pointer;

  img {
    height: 100%;
  }
}

#footer {
  width: 100%;
  margin: 0;
  min-height: unset;
  margin-top: 4rem;
  box-shadow: none;
}

.v-toolbar.v-app-bar--is-scrolled > .v-toolbar__content > .container {
  align-items: center !important;
  will-change: padding;
  padding-top: 0;
  padding-bottom: 0;
}

.nav-items {
  border-radius: 2rem !important;
  overflow: hidden;

  .v-btn {
    margin: 0;
    border-radius: 0;
    height: 39px !important;
  }
}

.nav-items .v-btn.is-active,
.mobile-nav-items .v-list-item.is-active {
  background-color: #1976d2;
  color: #FFF;
}
</style>
