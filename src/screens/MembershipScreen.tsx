import { Alert, StyleSheet, Platform } from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  ComparisonTable,
  Text,
  TextLink,
  View
} from '../components'
import { buy1YearPremium, androidHandleStatusCheck, iosHandlePurchaseStatusCheck } from '../lib/purchase'
import {
  getMembershipExpiration,
  getMembershipStatus,
  readableDate
} from '../lib/utility'
import { PV } from '../resources'
import { getAuthUserInfo } from '../state/actions/auth'
import { getMembershipTextStyle } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  isLoading: boolean
}

export class MembershipScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Membership'
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      isLoading: true
    }
  }

  async componentDidMount() {
    try {
      await getAuthUserInfo()
    } catch (error) {
      //
    }
    this.setState({ isLoading: false })
  }

  handleRenewPress = async () => {
    try {
      await buy1YearPremium()
    } catch (error) {
      console.log(error)

      // If attempting to renew, but a recent previous purchase did not complete successfully,
      // then do not buy a new product, and instead navigate to the PurchasingScreen
      // and attempt to check and update the status of the cached purchase.
      if (error.code === 'E_ALREADY_OWNED') {
        if (Platform.OS === 'android') {
          this.props.navigation.navigate(PV.RouteNames.PurchasingScreen)
          const { orderId, productId, purchaseToken } = this.global.purchase
          await androidHandleStatusCheck(productId, purchaseToken, orderId)
        } else if (Platform.OS === 'ios') {
          await iosHandlePurchaseStatusCheck()
        }
      } else {
        Alert.alert(
          PV.Alerts.PURCHASE_SOMETHING_WENT_WRONG.title,
          PV.Alerts.PURCHASE_SOMETHING_WENT_WRONG.message,
          PV.Alerts.BUTTONS.OK
        )
      }

    }
  }

  handleSignUpPress = () => {
    this.props.navigation.navigate(PV.RouteNames.AuthScreen, {
      showSignUp: true
    })
  }

  render() {
    const { isLoading } = this.state
    const { globalTheme, session } = this.global
    const { isLoggedIn, userInfo } = session
    const membershipStatus = getMembershipStatus(userInfo)
    const membershipTextStyle = getMembershipTextStyle(
      globalTheme,
      membershipStatus
    )
    const expirationDate = getMembershipExpiration(userInfo)

    return (
      <View style={styles.wrapper}>
        {isLoading && isLoggedIn && <ActivityIndicator />}
        {!isLoading && isLoggedIn && membershipStatus && (
          <View>
            <View style={styles.textRow}>
              <Text style={styles.label}>Status: </Text>
              <Text style={[styles.text, membershipTextStyle]}>
                {membershipStatus}
              </Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.label}>Expires: </Text>
              <Text style={[styles.text]}>{readableDate(expirationDate)}</Text>
            </View>
            <View style={styles.textRowCentered}>
              <TextLink
                onPress={this.handleRenewPress}
                style={[styles.subText]}>
                Renew Membership
              </TextLink>
            </View>
          </View>
        )}
        {!isLoading && !isLoggedIn && (
          <View>
            <View style={styles.textRowCentered}>
              <Text style={styles.subTextCentered}>
                Get 1 year of Podverse Premium for free
              </Text>
            </View>
            <View style={styles.textRowCentered}>
              <Text style={styles.subTextCentered}>
                $10/year after that
              </Text>
            </View>
            <View style={styles.textRowCentered}>
              <TextLink
                onPress={this.handleSignUpPress}
                style={[styles.subText]}>
                Sign Up
              </TextLink>
            </View>
          </View>
        )}
        {!isLoading && (
          <View style={styles.tableWrapper}>
            <ComparisonTable
              column1Title='Free'
              column2Title='Premium'
              data={comparisonData}
              mainTitle='Features'
            />
          </View>
        )}
      </View>
    )
  }
}

const comparisonData = [
  {
    text: 'subscribe to podcasts',
    column1: true,
    column2: true
  },
  {
    text: 'play clips and episodes',
    column1: true,
    column2: true
  },
  {
    text: 'manage your queue',
    column1: true,
    column2: true
  },
  {
    text: 'create sharable clips of any length',
    column1: true,
    column2: true
  },
  {
    text: 'sync your subscriptions on all devices',
    column1: false,
    column2: true
  },
  {
    text: 'sync your queue on all devices',
    column1: false,
    column2: true
  },
  {
    text: 'create playlists',
    column1: false,
    column2: true
  },
  {
    text: 'auto save your clips to a playlist',
    column1: false,
    column2: true
  },
  {
    text: 'edit your clips',
    column1: false,
    column2: true
  },
  {
    text: 'share your profile',
    column1: false,
    column2: true
  },
  {
    text: 'download a backup of your data',
    column1: false,
    column2: true
  },
  {
    text: 'support open source software',
    column1: true,
    column2: true,
    isSmile: true
  }
]

const styles = StyleSheet.create({
  label: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  subText: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold
  },
  subTextCentered: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    textAlign: 'center'
  },
  tableWrapper: {
    flex: 1,
    marginTop: 12
  },
  text: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold
  },
  textCentered: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold,
    textAlign: 'center'
  },
  textRow: {
    flexDirection: 'row',
    margin: 8
  },
  textRowCentered: {
    flexDirection: 'row',
    marginHorizontal: 8,
    marginVertical: 4,
    justifyContent: 'center',
    textAlign: 'center'
  },
  wrapper: {
    flex: 1,
    paddingTop: 8
  }
})
