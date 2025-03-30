const { useState } = React;

const CourierCalculator = () => {
  // Estados para el peso y valor del producto
  const [weight, setWeight] = useState(5);
  const [productValue, setProductValue] = useState(8000);
  const [selectedCourier, setSelectedCourier] = useState('Alexim');
  
  // 
};

// Renderiza el componente en el DOM
ReactDOM.render(<CourierCalculator />, document.getElementById('root'));
