import React, { Component } from 'react';
import { tradesService } from '../../services/index'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
} from 'reactstrap';
import { Colors } from '../../constants';
import { getCurrencyAmount } from '../../helpers/text';
import { TradesModal } from '../../containers/TradesModal';

const getBadgeColor = (type) => {
  switch (type) {
    case 'buy': return 'success';
    case 'sell': return 'danger';
    default: return 'secondary';
  }
}

export default class Trades extends Component {
  state = {
    trades: []
  }

  componentDidMount() {
    this.getData()
  }

  getData = () => {
    this.setState({ loading: true });

    tradesService.getTrades()
      .then(data => {
        this.setState({ trades: data.trades, loading: false });
      })
      .catch(err => this.setState({ errorMessage: err.message, loading: false }))
  }

  render() {
    const { trades, loading, showModal } = this.state;

    return (
      <>
      <Row>
        <Col xl={12}>
          {loading && (<><br></br><p>Loading...</p></>)}
          {!!trades?.length && <Card>
              <CardHeader>
                Trades
              <div className="card-header-actions">
                  <Button
                    style={{ backgroundColor: Colors.brandRed, color: Colors.brandWhite, fontWeight: 'bold' }}
                    onClick={(e => this.setState({ showModal: true }))}
                  >Add trade</Button>
                </div>
              </CardHeader>
            <CardBody>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Symbol</th>
                    <th scope="col">Name</th>
                    <th scope="col">Type</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Unit Price</th>
                    <th scope="col">Total amount</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => {
                    const color = trade.total_amount > 0 ? Colors.brandGreen : Colors.brandRed;

                    return (
                      <tr key={trade.id}>
                        <td>{trade.date}</td>
                        <td>{trade.symbol}</td>
                        <td>{trade.name}</td>
                        
                        <td>
                          <span class={`badge badge-${getBadgeColor(trade.trade_type)}`}>
                          {String(trade.trade_type).toUpperCase()}
                          </span>
                        </td>
                        <td>{trade.quantity}</td>
                        <td>{getCurrencyAmount(trade.unit_price)}</td>
                        <td style={{ fontWeight: 'bold', color }} >{getCurrencyAmount(trade.total_amount)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </CardBody>
          </Card>}
        </Col>
      </Row>
      <TradesModal
          show={showModal} 
          onClose={() => this.setState({ showModal: false })} 
          onTradeCreated={() => {
            this.setState({ showModal: false })
            this.getData()
          }} 
        />
      </>
    )
  }

}