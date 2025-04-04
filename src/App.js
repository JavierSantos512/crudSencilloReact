import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Table,
  Button,
  Container,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  ModalFooter,
  Spinner,
  Alert
} from "reactstrap";

class App extends React.Component {
  state = {
    data: [],
    modalActualizar: false,
    modalInsertar: false,
    loading: false,
    error: null,
    form: {
      id: "",
      recolector: "",
      finca: "",
    },
  };

  // Cuando el componente se monta, carga los datos
  componentDidMount() {
    this.obtenerRecolectores();
  }

  // Obtener los recolectores desde la API
  obtenerRecolectores = () => {
    this.setState({ loading: true, error: null });
    
    fetch('http://localhost:5000/api/recolectores')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }
        return response.json();
      })
      .then(data => {
        this.setState({ data, loading: false });
      })
      .catch(error => {
        console.error('Error:', error);
        this.setState({ error: error.message, loading: false });
      });
  };

  mostrarModalActualizar = (dato) => {
    this.setState({
      form: dato,
      modalActualizar: true,
    });
  };

  cerrarModalActualizar = () => {
    this.setState({ modalActualizar: false });
  };

  mostrarModalInsertar = () => {
    this.setState({
      modalInsertar: true,
      form: {
        id: "",
        recolector: "",
        finca: "",
      },
    });
  };

  cerrarModalInsertar = () => {
    this.setState({ modalInsertar: false });
  };

  // Actualizar un registro a través de la API
  editar = (dato) => {
    this.setState({ loading: true, error: null });
    
    fetch(`http://localhost:5000/api/recolectores/${dato.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recolector: dato.recolector,
        finca: dato.finca
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al actualizar el registro');
        }
        return response.json();
      })
      .then(() => {
        this.obtenerRecolectores();
        this.setState({ modalActualizar: false });
      })
      .catch(error => {
        console.error('Error:', error);
        this.setState({ error: error.message, loading: false });
      });
  };

  // Eliminar un registro a través de la API
  eliminar = (dato) => {
    var opcion = window.confirm("¿Estás seguro que deseas eliminar el elemento " + dato.id + "?");
    if (opcion) {
      this.setState({ loading: true, error: null });
      
      fetch(`http://localhost:5000/api/recolectores/${dato.id}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Error al eliminar el registro');
          }
          return response.json();
        })
        .then(() => {
          this.obtenerRecolectores();
        })
        .catch(error => {
          console.error('Error:', error);
          this.setState({ error: error.message, loading: false });
        });
    }
  };

  // Insertar un nuevo registro a través de la API
  insertar = () => {
    const { recolector, finca } = this.state.form;
    
    if (!recolector || !finca) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    this.setState({ loading: true, error: null });
    
    fetch('http://localhost:5000/api/recolectores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recolector: recolector,
        finca: finca
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al crear el registro');
        }
        return response.json();
      })
      .then(() => {
        this.obtenerRecolectores();
        this.setState({ modalInsertar: false });
      })
      .catch(error => {
        console.error('Error:', error);
        this.setState({ error: error.message, loading: false });
      });
  };

  handleChange = (e) => {
    this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value,
      },
    });
  };

  render() {
    const { loading, error, data } = this.state;
    
    return (
      <>
        <Container>
          <br />
          <Button color="success" onClick={this.mostrarModalInsertar}>Crear</Button>
          <br />
          <br />
          
          {error && <Alert color="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center">
              <Spinner color="primary" />
              <p>Cargando datos...</p>
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Recolector</th>
                  <th>Finca</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {data.map((dato) => (
                  <tr key={dato.id}>
                    <td>{dato.id}</td>
                    <td>{dato.recolector}</td>
                    <td>{dato.finca}</td>
                    <td>
                      <Button
                        color="primary"
                        onClick={() => this.mostrarModalActualizar(dato)}
                      >
                        Editar
                      </Button>{" "}
                      <Button color="danger" onClick={() => this.eliminar(dato)}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Container>

        <Modal isOpen={this.state.modalActualizar}>
          <ModalHeader>
            <div><h3>Editar Registro</h3></div>
          </ModalHeader>

          <ModalBody>
            <FormGroup>
              <label>
                Id:
              </label>
              <input
                className="form-control"
                readOnly
                type="text"
                value={this.state.form.id}
              />
            </FormGroup>
            
            <FormGroup>
              <label>
                Recolector: 
              </label>
              <input
                className="form-control"
                name="recolector"
                type="text"
                onChange={this.handleChange}
                value={this.state.form.recolector}
              />
            </FormGroup>
            
            <FormGroup>
              <label>
                Finca: 
              </label>
              <input
                className="form-control"
                name="finca"
                type="text"
                onChange={this.handleChange}
                value={this.state.form.finca}
              />
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button
              color="primary"
              onClick={() => this.editar(this.state.form)}
            >
              Editar
            </Button>
            <Button
              color="danger"
              onClick={() => this.cerrarModalActualizar()}
            >
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.modalInsertar}>
          <ModalHeader>
            <div><h3>Insertar Registro</h3></div>
          </ModalHeader>

          <ModalBody>
            <FormGroup>
              <label>
                Recolector: 
              </label>
              <input
                className="form-control"
                name="recolector"
                type="text"
                onChange={this.handleChange}
                value={this.state.form.recolector}
              />
            </FormGroup>
            
            <FormGroup>
              <label>
                Finca: 
              </label>
              <input
                className="form-control"
                name="finca"
                type="text"
                onChange={this.handleChange}
                value={this.state.form.finca}
              />
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button
              color="primary"
              onClick={this.insertar}
            >
              Insertar
            </Button>
            <Button
              className="btn btn-danger"
              onClick={this.cerrarModalInsertar}
            >
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  }
}

export default App;