const { useState } = React;

const CourierCalculator = () => {
  // Estados para el peso y valor del producto
  const [weight, setWeight] = useState(5);
  const [productValue, setProductValue] = useState(8000);
  const [selectedCourier, setSelectedCourier] = useState('Alexim');

  // Función para formatear números con separador de miles
  const formatNumber = (value) => {
    return parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // El resto del código del componente...
  // (pega el resto del componente aquí)
};

// Renderiza el componente en el DOM
ReactDOM.render(<CourierCalculator />, document.getElementById('root'));
