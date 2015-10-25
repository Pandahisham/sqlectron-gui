import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as ServersActions from '../actions/servers.js';
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import ServerList from '../components/server-list.jsx';
import ServerModalForm from '../components/server-modal-form.jsx';
import ServerFilter from '../components/server-filter.jsx';


const STYLES = {
  wrapper: { paddingTop: '50px' },
  container: { padding: '10px' },
};


const BREADCRUMB = [{ icon: 'server', label: 'servers'}];


export default class ServerManagerment extends Component {
  static propTypes = {
    status: PropTypes.string.isRequired,
    servers: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    routeParams: PropTypes.object.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }),
    children: PropTypes.node,
  };

  static contextTypes = {
    history: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentDidMount() {
    this.props.dispatch(ServersActions.loadServers());
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.processing && !nextProps.servers.error) {
      this.setState({
        processing: false,
        selectedId: null,
        modalVisible: false,
      });
    }
  }

  onConnectClick(id, { database }) {
    this.props.history.pushState(null, `/server/${id}/database/${database}`);
  }

  onAddClick() {
    this.setState({ modalVisible: true, selectedId: null });
  }

  onEditClick(index) {
    this.setState({ modalVisible: true, selectedId: index });
  }

  onSaveClick(server) {
    const { selectedId } = this.state;
    const { dispatch } = this.props;
    this.setState({ processing: true });
    dispatch(ServersActions.saveServer({ id: selectedId, server }))
      .then(() => this.setState({ processing: true }));
  }

  onCancelClick() {
    this.setState({ modalVisible: false, selectedId: null });
  }

  onRemoveClick() {
    const { selectedId } = this.state;
    const { dispatch } = this.props;
    dispatch(ServersActions.removeServer({ id: selectedId }))
      .then(() => this.setState({ processing: true }));
  }

  onFilterChange(event) {
    this.setState({ filter: event.target.value });
  }

  filterServers(name, servers) {
    const regex = RegExp(name, 'i');
    return servers.filter(srv => regex.test(srv.name));
  }

  render() {
    const { modalVisible, selectedId, filter } = this.state;
    const { servers, status } = this.props;
    const selected = selectedId !== null ? servers.items[selectedId] : {};
    const filteredServers = this.filterServers(filter, servers.items);

    return (
      <div style={STYLES.wrapper}>
        <div style={STYLES.header}>
          <Header items={BREADCRUMB} />
        </div>
        <div style={STYLES.container}>
          <ServerFilter
            onFilterChange={::this.onFilterChange}
            onAddClick={::this.onAddClick} />

          <ServerList servers={filteredServers}
                      onEditClick={::this.onEditClick}
                      onConnectClick={::this.onConnectClick} />

          {modalVisible && <ServerModalForm
                 server={selected}
                 error={servers.error}
                 onSaveClick={::this.onSaveClick}
                 onCancelClick={::this.onCancelClick}
                 onRemoveClick={::this.onRemoveClick} />}
        </div>
        <div style={STYLES.footer}>
          <Footer status={status} />
        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    servers: state.servers,
    status: state.status,
  };
}

export default connect(mapStateToProps)(ServerManagerment);
