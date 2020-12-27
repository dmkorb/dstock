import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { Colors } from '../../constants';
import { getCurrencyAmount } from '../../helpers/text';
import { getNPositions } from '../../helpers/charts';
import { holdingsService } from '../../services/index';
import { CChartLine } from '@coreui/react-chartjs'

export default class Holdings extends Component {
  state = {
    holdings: []
  }

  componentDidMount() {
    this.getData()
  }

  getData = () => {
    this.setState({ loading: true });

    holdingsService.getHoldings()
      .then(data => {
        this.setState({ holdings: data.holdings, loading: false });
      })
      .catch(err => this.setState({ errorMessage: err.message, loading: false }))
  }

  render() {
    const { holdings, loading } = this.state;

    return (
      <Row>
        <Col xl={12}>
          {loading && (<><br></br><p>Loading...</p></>)}

          {!!holdings?.length && <Row>
            {holdings.map((holding, idx) => {
              const color = holding.performance > 0 ? Colors.brandGreen :
                holding.performance === 0 ? Colors.brandGrey3 : Colors.brandRed;

              return (
                <Col xl={4} key={idx}>
                  <Card>
                    <CardHeader>{holding.symbol}</CardHeader>
                    <CardBody>
                      <h3>{holding.name}</h3>
                      <p style={{ margin: 0 }}>Shares: <strong>{holding.shares}</strong></p>
                      <p style={{ margin: 0 }}>Current price: <strong>{getCurrencyAmount(holding.quote)}</strong></p>
                      <p style={{ margin: 0 }}>Equity: <strong>{getCurrencyAmount(holding.equity)}</strong></p>
                      <p style={{ margin: 0 }}>Gains: <span style={{ fontWeight: 'bold', color }} >{getCurrencyAmount(holding.gains)}</span></p>
                      <p style={{ margin: 0 }}>Performance: <span style={{ fontWeight: 'bold', color }} >{Number(holding.performance).toFixed(1)} %</span></p>
                      <CChartLine
                        datasets={[
                          
                          {
                            label: 'Gains',
                            backgroundColor: Colors.brandBlack + '55',
                            data: getNPositions(holding.positions, 7, 'gains')
                          },
                          {
                            label: 'Equity',
                            backgroundColor: Colors.brandGreen,
                            data: getNPositions(holding.positions, 7, 'equity')
                          },
                        ]}
                        options={{
                          tooltips: {
                            enabled: true
                          }
                        }}
                        labels={getNPositions(holding.positions, 7, 'date')}
                      />
                    </CardBody>
                  </Card>
                </Col>
              )

            })}
          </Row>}
        </Col>
      </Row>
    )
  }

}