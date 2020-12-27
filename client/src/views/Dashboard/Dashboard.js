import React, { Component } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Jumbotron,
  Row,
  Table,
} from 'reactstrap';
import { CChartLine } from '@coreui/react-chartjs'
import { Colors } from '../../constants';
import { portfoliosService } from '../../services/index'
import { getCurrencyAmount } from '../../helpers/text';
import { getNPositions } from '../../helpers/charts';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      portfolios: []
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    this.setState({ loadingPortfolios: true });

    portfoliosService.getPortfolios()
      .then(async data => {
        // Get detailed portfolio for every ID
        const portfolios = await Promise.all(data.portfolios.map(p => portfoliosService.getPortfolio(p.id)));
        this.setState({ portfolios, loadingPortfolios: false, loadingPositions: true });

        // Load positions asynchronously
        const positions = await Promise.all(data.portfolios.map(p => portfoliosService.getPortfolioPositions(p.id)))
        this.setState({ positions, loadingPositions: false })
      })
      .catch(err => this.setState({ errorMessage: err.message, loadingPortfolios: false }))
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  renderPositionsForPortfolio = (portfolioId) => {
    let { positions } = this.state;
    if (!positions) return (<><br></br><p>Loading positions...</p></>);

    const portfolioPosition = positions?.find(p => p.id === portfolioId);
    if (!portfolioPosition) return (<><br></br><p>Did not found positions for this portfolio</p></>);
    const points = 100;

    return (
      <Card>
        <CardHeader>Performance</CardHeader>
        <CardBody>
          <CChartLine
            style={{ height: 400 }}
            datasets={[
              {
                label: 'Gains',
                backgroundColor: Colors.brandBlack + '55',
                data: getNPositions(portfolioPosition.positions, points, 'gains')
              },
              {
                label: 'Equity',
                backgroundColor: Colors.brandGreen,
                data: getNPositions(portfolioPosition.positions, points, 'equity')
              },
            ]}
            options={{
              tooltips: {
                enabled: true
              },
              maintainAspectRatio: false,
            }}
            labels={getNPositions(portfolioPosition.positions, points, 'date')}
          />
        </CardBody>
      </Card>
    )
  }

  render() {
    let { portfolios, positions, loadingPortfolios } = this.state;

    return (
      <div className="animated fadeIn">
        {/* {!portfolios.length && !loadingPortfolios && <Jumbotron>
          <h4 className="display-3">Olá!</h4>
          <p className="lead">Cansado de ter que abrir vários apps diferentes
            para acompanhar seus gastos e consultar seus saldos? O dstock. vai resolver o seu problema.</p>
          <hr className="my-2" />
          <p>Comece adicionando uma conta bancária, e veja a mágica acontecer.</p>
          <p className="lead">
            <Button
              style={{ backgroundColor: Colors.brandGreen }}
              onClick={(e) => {
                e.preventDefault();
                this.props.history.push('accounts/new');
              }}
            >Adicionar conta</Button>
          </p>
        </Jumbotron>} */}

        {portfolios.map(portfolio => (<>
          <h5 className="display-5">{portfolio.name}</h5>
          <Row>
            <Col xs="12" sm="6" lg="3">
              <Card className="text-white bg-brand-green" style={{ height: '160px' }}>
                <CardBody className="pb-0">
                  <div>Amount invested</div>
                  {loadingPortfolios && (<><br></br><p>Loading...</p></>)}
                  <div className="text-value"> {getCurrencyAmount(portfolio.amount_invested - portfolio.amount_withdrawn)}</div>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" sm="6" lg="3">
              <Card className="text-white bg-brand-green" style={{ height: '160px' }}>
                <CardBody className="pb-0">
                  <div>Equity</div>
                  {loadingPortfolios && (<><br></br><p>Loading...</p></>)}
                  <div className="text-value"> {getCurrencyAmount(portfolio.equity)}</div>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" sm="6" lg="3">
              <Card className="text-white bg-brand-green" style={{ height: '160px' }}>
                <CardBody className="pb-0">
                  <div>Gains</div>
                  {loadingPortfolios && (<><br></br><p>Loading...</p></>)}
                  <div className="text-value"> {getCurrencyAmount(portfolio.gains)}</div>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" sm="6" lg="3">
              <Card className="text-white bg-brand-green" style={{ height: '160px' }}>
                <CardBody className="pb-0">
                  <div>Performance</div>
                  {loadingPortfolios && (<><br></br><p>Loading...</p></>)}
                  <div className="text-value">{Number(portfolio.performance).toFixed(1)} %</div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Chart */}
          {this.renderPositionsForPortfolio(portfolio.id)}

          {/* Table */}
          <Row>
            <Col xl={12}>
              {loadingPortfolios && (<><br></br><p>Loading...</p></>)}
              {!!portfolio.holdings?.length && <Card>
                <CardHeader>Holdings</CardHeader>
                <CardBody>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th scope="col">Symbol</th>
                        <th scope="col">Name</th>
                        <th scope="col">Shares</th>
                        <th scope="col">Price</th>
                        <th scope="col">Amount invested</th>
                        <th scope="col">Equity</th>
                        <th scope="col">Gains</th>
                        <th scope="col">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.holdings.map((holding) => {

                        const color = holding.performance > 0 ? Colors.brandGreen :
                          holding.performance === 0 ? Colors.brandGrey3 : Colors.brandRed;

                        return <tr key={holding.id}>
                          <td>{holding.symbol}</td>
                          <td>{holding.name}</td>
                          <td>{holding.shares}</td>
                          <td>{getCurrencyAmount(holding.quote)}</td>
                          <td>{getCurrencyAmount(holding.amount_invested - holding.amount_withdrawn)}</td>
                          <td>{getCurrencyAmount(holding.equity)}</td>
                          <td>{getCurrencyAmount(holding.gains)}</td>
                          <td style={{ fontWeight: 'bold', color }} >{Number(holding.performance).toFixed(1)} %</td>
                        </tr>
                      }
                      )}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>}
            </Col>
          </Row>
        </>
        )

      )}
      </div>
    );
  }
}