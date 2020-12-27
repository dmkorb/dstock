import React, { Component, } from 'react';
import CurrencyInput from 'react-currency-input';
import { 
  Button, 
  Modal, 
  ModalBody, 
  ModalFooter, 
  ModalHeader, 
  Col,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import { Colors } from '../constants';
import LoadingSpinner from './LoadingSpinner'
import { getCurrencyAmount } from '../helpers/text';
import { portfoliosService, tradesService } from '../services/';

const TRADE_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
}

export class TradesModal extends Component {
  state = {
    portfolios: [],
    trade_type: TRADE_TYPES.BUY
  }

  componentDidMount() {
    portfoliosService.getPortfolios()
      .then(data => {
        this.setState({ portfolios: data.portfolios })
        if (data.portfolios.length === 1) {
          this.setState({ portfolio_id: data.portfolios[0].id })
        }
      })
      .catch(err => this.setState({ error: err.message }))
  }

  onCreate = () => {
    const { 
      portfolio_id,
      trade_type,
      symbol,
      quantity,
      date,
      unit_price,
    } = this.state;
    const { onTradeCreated } = this.props;
    const data = {
      portfolio_id,
      trade_type,
      symbol,
      quantity,
      date,
      unit_price,
    };

    this.setState({ error: false, loading: true})
    tradesService.createTrade(data)
      .then(trade => {
        console.log('Created trade', trade)
        if (onTradeCreated && typeof onTradeCreated === 'function') onTradeCreated(trade);
      })
      .catch(err => this.setState({ error: err.message }))
      .finally(() => this.setState({ loading: false }))
  }

  render() {
    const { 
      portfolios, 
      portfolio_id,
      trade_type,
      symbol,
      quantity,
      date,
      unit_price,
      error,
      loading
    } = this.state;

    const { show, onClose } = this.props;
    const amount = (quantity || 0) * (unit_price || 0);
    return (
      <Modal isOpen={show} toggle={onClose} /*className={this.props.className}*/>
        <ModalHeader toggle={onClose}>Add trade</ModalHeader>
        <ModalBody>
          <Form action="" method="post" encType="multipart/form-data" className="form-horizontal">
            <FormGroup row>
              <Col md="3">
                <Label htmlFor="select">Portfolio</Label>
              </Col>
              <Col xs="12" md="9">
                <Input type="select" name="select" id="select" 
                  value={portfolio_id}
                  onChange={(e) => this.setState({ portfolio_id: e.target.value })}>
                  <option value="0">Please select</option>
                  {portfolios.map((p, idx) => <option value={p.id}>{p.name}</option>)}
                </Input>
              </Col>
            </FormGroup>

            <FormGroup row>
              <Col md="3">
                <Label htmlFor="select">Trade type</Label>
              </Col>
              <Col xs="12" md="9">
                <Input
                  type="select"
                  name="select"
                  id="select"
                  value={trade_type}
                  onChange={(e) => this.setState({ trade_type: e.target.value })}>
                  <option value={TRADE_TYPES.BUY} >Buy</option>
                  <option value={TRADE_TYPES.SELL}>Sell</option>
                </Input>
              </Col>
            </FormGroup>

            <FormGroup row>
              <Col md="3">
                <Label htmlFor="text-input">Stock</Label>
              </Col>
              <Col xs="12" md="9">
                <Input
                  type="text"
                  id="text-input"
                  name="text-input"
                  placeholder="Stock symbol. i.e: AAPL, TSLA"
                  value={symbol}
                  onChange={(e) => this.setState({ symbol: e.target.value })}
                />
              </Col>
            </FormGroup>

            <FormGroup row>
              <Col md="3">
                <Label htmlFor="date-input">Date </Label>
              </Col>
              <Col xs="12" md="9">
                <Input
                  type="date"
                  id="date-input"
                  name="date-input"
                  placeholder="date"
                  value={date}
                  onChange={(e) => this.setState({ date: e.target.value })}
                />
              </Col>
            </FormGroup>

            <FormGroup row>
              <Col md="3">
                <Label htmlFor="text-input">Quantity</Label>
              </Col>
              <Col xs="12" md="3">
                <Input
                  type="text"
                  id="text-input"
                  name="text-input"
                  placeholder="Number"
                  value={quantity}
                  onChange={(e) => this.setState({ quantity: e.target.value })}
                />
              </Col>

              <Col md="2">
                <Label htmlFor="text-input">Unit Price</Label>
              </Col>
              <Col xs="12" md="4">
                <CurrencyInput 
                type="text"
                  prefix="$ " 
                  className="form-control"
                  value={unit_price}
                  onChange={(e, masked) => this.setState({ 
                    unit_price: masked, 
                  })}
                  />
{/* 
                <Input
                  type="text"
                  id="text-input"
                  name="text-input"
                  placeholder="$ "
                  value={unit_price}
                  onChange={(e) => this.setState({ unit_price: e.target.value })}
                /> */}
              </Col>
            </FormGroup>

          </Form>
          {!!amount && <p>Estimated amount: {getCurrencyAmount(amount)}</p>}
          {error && <div class="alert alert-danger" role="alert">{error}</div>}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary outline" onClick={onClose}>Cancel</Button>
          <Button 
            style={{ 
              backgroundColor: trade_type === TRADE_TYPES.BUY 
              ? Colors.brandGreen
              : Colors.brandRed, 
              color: '#FFF', fontWeight: 'bold' }} 
            onClick={this.onCreate}>
              Create {this.state.trade_type} trade
              {loading && <LoadingSpinner/>}
            </Button>
        </ModalFooter>
      </Modal>
    )
  }
}