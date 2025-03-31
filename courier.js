const { useState } = React;

const CourierCalculator = () => {
  // Estados para el peso y valor del producto con valores iniciales corregidos
  const [weight, setWeight] = useState(1);
  const [productValue, setProductValue] = useState(20);
  const [selectedCourier, setSelectedCourier] = useState('Alexim');
  const [considerIGV, setConsiderIGV] = useState('Si'); // Nuevo estado para la opción de IGV

  // Función para formatear números con separador de miles
  const formatNumber = (value) => {
    return parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Función para asegurar que el peso mínimo sea 1 kg para los cálculos
  const getEffectiveWeight = () => {
    return Math.max(1, weight);
  };

  // Cálculos para cada courier con las fórmulas corregidas y peso mínimo
  const calculateMSL = () => {
    const effectiveWeight = getEffectiveWeight();
    const precioPorKg = effectiveWeight * 8.00;
    const gastosOperativos = 11.80;
    const delivery = 5.90;
    const total = precioPorKg + gastosOperativos + delivery;
    
    return {
      precioPorKg: precioPorKg,
      gastosOperativos: gastosOperativos,
      delivery: delivery,
      total: total
    };
  };

  const calculateFirstClass = () => {
    const effectiveWeight = getEffectiveWeight();
    const precioPorKg = effectiveWeight * 6.50;
    const gastosOperativos = 6.00;
    const delivery = 10.00;
    const total = precioPorKg + gastosOperativos + delivery;
    
    return {
      precioPorKg: precioPorKg,
      gastosOperativos: gastosOperativos,
      delivery: delivery,
      total: total
    };
  };

  const calculateAlexim = () => {
    const effectiveWeight = getEffectiveWeight();
    const precioPorKg = effectiveWeight * 5.00;
    const gastosOperativos = 5.90;
    const delivery = 1.18;
    
    // Ajustar el total según la opción de IGV para Alexim
    let total = precioPorKg + gastosOperativos + delivery;
    
    // Si se selecciona "No" para considerar IGV, se resta 1.08 del total solo para Alexim
    if (considerIGV === 'No') {
      total = total - 1.08;
    }
    
    return {
      precioPorKg: precioPorKg,
      gastosOperativos: gastosOperativos,
      delivery: delivery,
      total: total
    };
  };

  // Cálculo de impuestos - aplicado cuando es mayor a 200
  const calculateTax = (courierTotal) => {
    // Convertimos a números para asegurar comparación correcta
    const productValueNum = parseFloat(productValue);
    const courierTotalNum = parseFloat(courierTotal);
    
    if (productValueNum > 200) {
      const tax = (courierTotalNum + productValueNum) * 0.22;
      const totalWithTax = courierTotalNum + productValueNum + tax;
      return {
        tax,
        totalWithTax
      };
    } else {
      return {
        tax: 0,
        totalWithTax: courierTotalNum + productValueNum
      };
    }
  };

  // Obtener resultados según el courier seleccionado
  const getResults = () => {
    switch(selectedCourier) {
      case 'MSL':
        return calculateMSL();
      case 'FirstClass':
        return calculateFirstClass();
      case 'Alexim':
        return calculateAlexim();
      default:
        return calculateAlexim();
    }
  };

  const courierResults = getResults();
  const taxResults = calculateTax(courierResults.total);

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      {/* Header con logos */}
      <div className="flex justify-between items-center mb-4">
        <div className="w-1/3 flex space-x-2">
          <img src="https://github.com/user-attachments/assets/d747658e-ecbf-4636-8790-8ca515ed6658" alt="Unaluka-com" className="h-12" />
          <img src="https://github.com/user-attachments/assets/47baaf3b-d1b7-4b37-bc2e-1b17f4ae8b49" alt="Unaluka-global" className="h-12" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 text-center w-1/3">Cotizador de Courier</h1>
        <div className="w-1/3 flex justify-end">
          <img src="https://github.com/user-attachments/assets/2c3b386c-4af8-41a0-8b20-562bd4bdb291" alt="Aztra" className="h-12" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Courier</label>
            <select 
              className="w-full p-2 border rounded text-gray-900 bg-white"
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
            >
              <option value="Alexim">Alexim</option>
              <option value="FirstClass">FirstClass</option>
              <option value="MSL">MSL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Peso (kg)</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0.1)}
              className="w-full p-2 border rounded text-gray-900 bg-white"
            />
            {weight < 1 && (
              <p className="text-xs text-orange-600 mt-1">* Se aplicará tarifa mínima de 1 kg.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Valor del Producto (US$)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={productValue}
              onChange={(e) => setProductValue(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded text-gray-900 bg-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Considerar IGV para Gastos Operativos + Delivery?</label>
            <select 
              className="w-full p-2 border rounded text-gray-900 bg-white"
              value={considerIGV}
              onChange={(e) => setConsiderIGV(e.target.value)}
            >
              <option value="Si">Si</option>
              <option value="No">No</option>
            </select>
            {selectedCourier === 'Alexim' && considerIGV === 'No' && (
              <p className="text-xs text-blue-600 mt-1">* Se restará $1.08 del total.</p>
            )}
          </div>
        </div>

        {/* Resultados del Courier */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900">Liquidación {selectedCourier}</h3>
          
          <div className="overflow-x-auto mt-2">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Peso</th>
                  <th className="p-2 text-left">Precio por Kg</th>
                  <th className="p-2 text-left">Gastos Operativos</th>
                  <th className="p-2 text-left">Delivery</th>
                  <th className="p-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b">{weight}</td>
                  <td className="p-2 border-b">{formatNumber(courierResults.precioPorKg)} US$</td>
                  <td className="p-2 border-b">{formatNumber(courierResults.gastosOperativos)} US$</td>
                  <td className="p-2 border-b">{formatNumber(courierResults.delivery)} US$</td>
                  <td className="p-2 border-b font-bold">{formatNumber(courierResults.total)} US$</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección de Impuestos */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900">Impuestos {selectedCourier}</h3>
          
          <div className="overflow-x-auto mt-2">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-yellow-100">
                  <th className="p-2 text-left">Precio de Producto</th>
                  <th className="p-2 text-left">Impuesto</th>
                  <th className="p-2 text-left">Total Producto + Comisión + Impuesto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b">{formatNumber(productValue)} US$</td>
                  <td className="p-2 border-b">{formatNumber(taxResults.tax)} US$</td>
                  <td className="p-2 border-b font-bold">{formatNumber(taxResults.totalWithTax)} US$</td>
                </tr>
              </tbody>
            </table>
          </div>
          {productValue <= 200 && (
            <p className="text-sm text-gray-600 mt-2">* No se aplica impuesto ya que el valor del producto no supera los $200.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Renderiza el componente en el DOM
ReactDOM.render(<CourierCalculator />, document.getElementById('root'));
