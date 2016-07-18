<?php

namespace Drupal\d3vis\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'D3VisBlock' block.
 *
 * @Block(
 *  id = "d3_vis_block",
 *  admin_label = @Translation("D3 Vis block"),
 * )
 */
class D3VisBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];
    $build['d3_vis_block']['#markup'] = 'D3 vis here.';
    $build['d3_vis_block']['#attached']['library'][] = 'd3vis/d3vis_src';
    $build['d3_vis_block']['#theme'] = 'd3vis';
    return $build;
  }

}
