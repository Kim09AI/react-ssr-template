export const autoFetch = Component => {
    class AutoFetchComponent extends Component {
        componentWillMount() {
            // eslint-disable-next-line
            if (process.env.isClient && !window.__INITIAL_URL__) {
                typeof super.bootstrap === 'function' && super.bootstrap()
            }
            typeof super.componentWillMount === 'function' && super.componentWillMount()
        }

        componentDidMount() {
            window.__INITIAL_URL__ && delete window.__INITIAL_URL__ // eslint-disable-line
            typeof super.componentDidMount === 'function' && super.componentDidMount()
        }
    }

    return AutoFetchComponent
}
