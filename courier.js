import React, { useState } from 'react';

const CourierCalculator = () => {
  // Estados para el peso y valor del producto con valores iniciales
  const [weight, setWeight] = useState(1);
  const [productValue, setProductValue] = useState(20);
  const [selectedCourier, setSelectedCourier] = useState('Alexim');
  const [considerIGV, setConsiderIGV] = useState('Si');
  const [canal, setCanal] = useState('Verde');
  const [considerEndose, setConsiderEndose] = useState('Si');
  const [dimensions, setDimensions] = useState({ length: 0, width: 0, height: 0 });
  
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
  
  // Función para calcular el peso volumétrico
  const calculateVolumetricWeight = () => {
    if (dimensions.length > 0 && dimensions.width > 0 && dimensions.height > 0) {
      // Fórmula: (Largo x Ancho x Alto) / 6000
      return (dimensions.length * dimensions.width * dimensions.height) / 6000;
    }
    return 0;
  };
  
  // Determinar si hay sobrecargo por OVERSIZE (volumen 5 veces mayor al peso)
  const isOversize = () => {
    const volumetricWeight = calculateVolumetricWeight();
    return volumetricWeight > 0 && volumetricWeight > (weight * 5);
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
    let precioPorKg = effectiveWeight * 5.00;
    let gastosOperativos, delivery;
    
    // Nuevas tarifas para Alexim según rangos de peso
    if (effectiveWeight >= 51 && effectiveWeight <= 70) {
      gastosOperativos = 20.00;
      delivery = 10.00;
    } else if (effectiveWeight >= 71 && effectiveWeight <= 100) {
      gastosOperativos = 35.00;
      delivery = 15.00;
    } else {
      gastosOperativos = 5.90;
      delivery = 1.18;
    }
    
    // Calculamos el IGV (18%) sobre gastos operativos y delivery
    const igvGastosOperativos = gastosOperativos * 0.18;
    const igvDelivery = delivery * 0.18;
    
    // Total con IGV
    const totalWithIGV = precioPorKg + gastosOperativos + delivery;
    
    // Ajustar el total según la opción de IGV para la visualización de liquidación
    let displayTotal = totalWithIGV;
    
    // Si se selecciona "No" para considerar IGV, se resta el IGV del total
    if (considerIGV === 'No') {
      displayTotal = totalWithIGV - (igvGastosOperativos + igvDelivery);
    }
    
    return {
      precioPorKg: precioPorKg,
      gastosOperativos: gastosOperativos,
      delivery: delivery,
      igvGastosOperativos: igvGastosOperativos,
      igvDelivery: igvDelivery,
      total: displayTotal,
      totalForTax: totalWithIGV // Total real para cálculo de impuestos
    };
  };

  // Función para calcular costos de aduana e impuestos según peso
  const calculateCustomCosts = () => {
    const effectiveWeight = getEffectiveWeight();
    
    let aduanaIGV = 115; // Valor fijo de $115 para Aduana + IGV en todos los rangos
    let almacenajeIGV = 0;
    let eeiCost = 0;
    
    // Solo varía el almacenaje según el rango de peso
    if (effectiveWeight <= 20) {
      almacenajeIGV = 120;
    } else if (effectiveWeight <= 40) {
      almacenajeIGV = 150;
    } else if (effectiveWeight <= 70) {
      almacenajeIGV = 150;
    } else if (effectiveWeight <= 100) {
      almacenajeIGV = 180;
    }
    
    // Cargo EEI para valores mayores a $2,500
    if (productValue > 2500) {
      eeiCost = 35;
    }
    
    return { aduanaIGV, almacenajeIGV, eeiCost };
  };

  // Cálculo de impuestos y cargos adicionales
  const calculateTax = (courierData) => {
    // Convertimos a números para asegurar comparación correcta
    const productValueNum = parseFloat(productValue);
    
    // Usamos el total correcto para impuestos (sin descontar IGV)
    const courierTotalNum = courierData.totalForTax !== undefined ? 
                            parseFloat(courierData.totalForTax) : 
                            parseFloat(courierData.total);
    
    let tax = 0;
    let aforoFisico = 0;
    let endoseCost = 0;
    let cif = 0;
    let hasCargosEspeciales = false;
    let oversize = 0;
    
    // Obtener costos de aduana
    const customCosts = calculateCustomCosts();
    
    // Verificar si hay sobrecargo por oversize
    if (isOversize()) {
      oversize = weight * 0.70; // 0.70 por kg para oversize
    }
    
    // Cargos especiales para valores superiores a $2000 (solo para Alexim)
    if (productValueNum > 2000 && selectedCourier === 'Alexim') {
      hasCargosEspeciales = true;
      
      // Si es canal rojo, agregar AFORO FÍSICO
      if (canal === 'Rojo') {
        aforoFisico = 35; // $35 + IGV
      }
      
      // Endose $45 + IGV, GOP $10 + IGV según imagen (solo si se considera endose)
      if (considerEndose === 'Si') {
        endoseCost = 45 + 10; // $45 + $10
      }
      
      // Hasta 0.20% del Valor CIF (solo para productos > $32000)
      if (productValueNum > 32000) {
        cif = productValueNum * 0.0075;
      }
    }
    
    // Impuesto normal del 22% para productos > $200
    if (productValueNum > 200) {
      tax = (courierTotalNum + productValueNum) * 0.22;
    }
    
    // Total con todos los cargos e impuestos
    const totalWithTax = courierTotalNum + productValueNum + tax + aforoFisico + endoseCost + 
                         cif + oversize + customCosts.aduanaIGV + customCosts.almacenajeIGV + 
                         customCosts.eeiCost;
    
    return {
      tax,
      totalWithTax,
      hasCargosEspeciales,
      aforoFisico,
      endoseCost,
      cif,
      oversize,
      customCosts
    };
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
  const taxResults = calculateTax(courierResults);

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      {/* Header con logos */}
      <div className="flex justify-between items-center mb-4">
        <div className="w-1/3">
          <h2 className="text-lg font-bold text-blue-700">UNALUKA</h2>
        </div>
        <h1 className="text-xl font-bold text-gray-900 text-center w-1/3">Cotizador de Courier</h1>
        <div className="w-1/3 flex justify-end">
          <h2 className="text-lg font-bold text-blue-700">AZTRA</h2>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <label className="block text-sm font-medium text-gray-900 mb-1">¿Considerar IGV?</label>
            <select 
              className="w-full p-2 border rounded text-gray-900 bg-white"
              value={considerIGV}
              onChange={(e) => setConsiderIGV(e.target.value)}
            >
              <option value="Si">Si</option>
              <option value="No">No</option>
            </select>
            {selectedCourier === 'Alexim' && considerIGV === 'No' && (
              <p className="text-xs text-blue-600 mt-1">* Se resta el IGV de gastos operativos (${courierResults.igvGastosOperativos?.toFixed(2)}) y delivery (${courierResults.igvDelivery?.toFixed(2)}).</p>
            )}
          </div>
          
          {/* Mostrar selector de canal si es Alexim y valor > $2000 */}
          {selectedCourier === 'Alexim' && productValue > 2000 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Canal</label>
              <select 
                className="w-full p-2 border rounded text-gray-900 bg-white"
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
              >
                <option value="Verde">Verde</option>
                <option value="Rojo">Rojo</option>
              </select>
              {canal === 'Rojo' && (
                <p className="text-xs text-orange-600 mt-1">* Se aplicará AFORO FÍSICO ($35 + IGV).</p>
              )}
            </div>
          )}
          
          {/* Mostrar selector de Endose si es Alexim y valor > $2000 */}
          {selectedCourier === 'Alexim' && productValue > 2000 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">¿Considerar Endose?</label>
              <select 
                className="w-full p-2 border rounded text-gray-900 bg-white"
                value={considerEndose}
                onChange={(e) => setConsiderEndose(e.target.value)}
              >
                <option value="Si">Si</option>
                <option value="No">No</option>
              </select>
              {considerEndose === 'Si' && (
                <p className="text-xs text-blue-600 mt-1">* Se aplicará ENDOSE ($45) + GOP ($10).</p>
              )}
            </div>
          )}
          
          {/* Campos para dimensiones */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Largo (cm)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={dimensions.length}
              onChange={(e) => setDimensions({...dimensions, length: parseFloat(e.target.value) || 0})}
              className="w-full p-2 border rounded text-gray-900 bg-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Ancho (cm)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={dimensions.width}
              onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value) || 0})}
              className="w-full p-2 border rounded text-gray-900 bg-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Alto (cm)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={dimensions.height}
              onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value) || 0})}
              className="w-full p-2 border rounded text-gray-900 bg-white"
            />
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
                  <td className="p-2 border-b">{weight} kg</td>
                  <td className="p-2 border-b">{formatNumber(courierResults.precioPorKg)} US$</td>
                  <td className="p-2 border-b">{formatNumber(courierResults.gastosOperativos)} US$</td>
                  <td className="p-2 border-b">{formatNumber(courierResults.delivery)} US$</td>
                  <td className="p-2 border-b font-bold">{formatNumber(courierResults.total)} US$</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección de Cargos Express */}
        {selectedCourier === 'Alexim' && productValue > 2000 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900">Cargos Express</h3>
            
            <div className="overflow-x-auto mt-2">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="p-2 text-left">Concepto</th>
                    <th className="p-2 text-left">Costo (US$)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-b">Flete</td>
                    <td className="p-2 border-b">{formatNumber(courierResults.precioPorKg)} US$</td>
                  </tr>
                  {isOversize() && (
                    <tr>
                      <td className="p-2 border-b">Oversize</td>
                      <td className="p-2 border-b">{formatNumber(taxResults.oversize)} US$</td>
                    </tr>
                  )}
                  {productValue > 2500 && (
                    <tr>
                      <td className="p-2 border-b">EEI</td>
                      <td className="p-2 border-b">{formatNumber(taxResults.customCosts.eeiCost)} US$</td>
                    </tr>
                  )}
                  <tr>
                    <td className="p-2 border-b font-bold">Total Cargos Express</td>
                    <td className="p-2 border-b font-bold">
                      {formatNumber(courierResults.precioPorKg + 
                                   (isOversize() ? taxResults.oversize : 0) + 
                                   (productValue > 2500 ? taxResults.customCosts.eeiCost : 0))} US$
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sección de Cargos en Destino */}
        {selectedCourier === 'Alexim' && productValue > 2000 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900">Cargos en Destino</h3>
            
            <div className="overflow-x-auto mt-2">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-100">
                    <th className="p-2 text-left">Concepto</th>
                    <th className="p-2 text-left">Costo (US$)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-b">Gastos Operativos</td>
                    <td className="p-2 border-b">{formatNumber(courierResults.gastosOperativos)} US$</td>
                  </tr>
                  {isOversize() && (
                    <tr>
                      <td className="p-2 border-b">Oversize Destino</td>
                      <td className="p-2 border-b">{formatNumber(taxResults.oversize)} US$</td>
                    </tr>
                  )}
                  <tr>
                    <td className="p-2 border-b">Almacenaje</td>
                    <td className="p-2 border-b">{formatNumber(taxResults.customCosts.almacenajeIGV)} US$</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">Agenciamiento</td>
                    <td className="p-2 border-b">{formatNumber(taxResults.customCosts.aduanaIGV)} US$</td>
                  </tr>
                  {(courierResults.delivery > 0) && (
                    <tr>
                      <td className="p-2 border-b">Reparto zona 1</td>
                      <td className="p-2 border-b">{formatNumber(courierResults.delivery)} US$</td>
                    </tr>
                  )}
                  <tr>
                    <td className="p-2 border-b">Sub Total</td>
                    <td className="p-2 border-b">
                      {formatNumber(courierResults.gastosOperativos + 
                                   (isOversize() ? taxResults.oversize : 0) + 
                                   taxResults.customCosts.almacenajeIGV + 
                                   taxResults.customCosts.aduanaIGV + 
                                   courierResults.delivery)} US$
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">IGV</td>
                    <td className="p-2 border-b">
                      {formatNumber((courierResults.gastosOperativos + 
                                    (isOversize() ? taxResults.oversize : 0) + 
                                    taxResults.customCosts.almacenajeIGV + 
                                    taxResults.customCosts.aduanaIGV + 
                                    courierResults.delivery) * 0.18)} US$
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b font-bold">Total Cargos en Destino</td>
                    <td className="p-2 border-b font-bold">
                      {formatNumber((courierResults.gastosOperativos + 
                                    (isOversize() ? taxResults.oversize : 0) + 
                                    taxResults.customCosts.almacenajeIGV + 
                                    taxResults.customCosts.aduanaIGV + 
                                    courierResults.delivery) * 1.18)} US$
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Sección de Impuestos */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900">Impuestos {selectedCourier}</h3>
          
          <div className="overflow-x-auto mt-2">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-yellow-100">
                  <th className="p-2 text-left">Precio de Producto</th>
                  <th className="p-2 text-left">Impuesto</th>
                  {taxResults.hasCargosEspeciales && (
                    <>
                      {canal === 'Rojo' && <th className="p-2 text-left">AFORO FÍSICO</th>}
                      {considerEndose === 'Si' && <th className="p-2 text-left">ENDOSE + GOP</th>}
                      {productValue > 32000 && <th className="p-2 text-left">% del Valor CIF</th>}
                      {isOversize() && <th className="p-2 text-left">OVERSIZE</th>}
                    </>
                  )}
                  <th className="p-2 text-left">Total General incl. IGV</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b">{formatNumber(productValue)} US$</td>
                  <td className="p-2 border-b">{formatNumber(taxResults.tax)} US$</td>
                  {taxResults.hasCargosEspeciales && (
                    <>
                      {canal === 'Rojo' && <td className="p-2 border-b">{formatNumber(taxResults.aforoFisico)} US$</td>}
                      {considerEndose === 'Si' && <td className="p-2 border-b">{formatNumber(taxResults.endoseCost)} US$</td>}
                      {productValue > 32000 && <td className="p-2 border-b">{formatNumber(taxResults.cif)} US$</td>}
                      {isOversize() && <td className="p-2 border-b">{formatNumber(taxResults.oversize * 2)} US$</td>}
                    </>
                  )}
                  <td className="p-2 border-b font-bold">{formatNumber(taxResults.totalWithTax)} US$</td>
                </tr>
              </tbody>
            </table>
          </div>
          {productValue <= 200 && (
            <p className="text-sm text-gray-600 mt-2">* No se aplica impuesto ya que el valor del producto no supera los $200.</p>
          )}
          {taxResults.hasCargosEspeciales && (
            <p className="text-sm text-blue-600 mt-2">* Se aplican cargos especiales para productos con valor mayor a $2,000.</p>
          )}
          {isOversize() && (
            <p className="text-sm text-orange-600 mt-2">* Se aplica sobrecargo por OVERSIZE (volumen 5 veces mayor al peso).</p>
          )}
        </div>
        

        
        {/* Total final con NUEVO TOTAL en amarillo si aplica EEI adicional */}
        {selectedCourier === 'Alexim' && productValue > 2500 && (
          <div className="mt-4 p-3 bg-yellow-300 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900">NUEVO TOTAL: {formatNumber(taxResults.totalWithTax)} US$</h3>
            <p className="text-sm text-gray-700 mt-1">* Incluye cargo adicional EEI de $35.00 para envíos mayores a $2,500.00</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierCalculator;
