# Aggiunge al progetto Xcode di Capacitor (ios/App/App.xcodeproj) le parti native di MyTurn:
#   - file Swift dell'app (plugin MyTurnNative, controller, foto dei widget)
#   - estensione widget per iPhone (MyTurnWidget)
#   - app per Apple Watch (MyTurnWatch) con le complicazioni (MyTurnWatchWidget)
# Si può lanciare più volte: aggiunge solo ciò che manca. Lo usa il workflow app.yml (gem xcodeproj).
# I file nuovi messi nelle cartelle vengono aggiunti da soli ai target giusti.
require 'xcodeproj'

ROOT = File.expand_path('../../ios/App', __dir__)
proj = Xcodeproj::Project.open(File.join(ROOT, 'App.xcodeproj'))
app = proj.targets.find { |t| t.name == 'App' } or abort 'target App non trovato'

VERSION = app.build_configurations.first.build_settings['MARKETING_VERSION'] || '1.0'
BUILD = app.build_configurations.first.build_settings['CURRENT_PROJECT_VERSION'] || '1'

def settings(target, hash)
  target.build_configurations.each { |c| hash.each { |k, v| c.build_settings[k] = v } }
end

def ensure_target(proj, name, type, platform, deployment)
  proj.targets.find { |t| t.name == name } || proj.new_target(type, name, platform, deployment)
end

def group(proj, dir)
  proj.main_group.children.find { |g| g.respond_to?(:path) && g.path == dir && g.isa == 'PBXGroup' } ||
    proj.main_group.new_group(dir, dir)
end

# aggiunge i file della cartella ai target: .swift in "Compile Sources", .xcassets e .xcstrings (traduzioni) in "Copy Bundle Resources"
def sync(proj, dir, targets)
  g = group(proj, dir)
  Dir.children(File.join(ROOT, dir)).sort.each do |name|
    ext = File.extname(name)
    next unless ['.swift', '.xcassets', '.xcstrings'].include?(ext)
    ref = g.files.find { |r| r.path == name } || g.new_reference(name)
    targets.each do |t|
      if ext == '.swift'
        t.source_build_phase.add_file_reference(ref, true)
      else
        t.resources_build_phase.add_file_reference(ref, true)
      end
    end
  end
  # file tolti dalla cartella: via anche dal progetto
  g.files.dup.each do |r|
    next unless r.path && ['.swift', '.xcassets', '.xcstrings'].include?(File.extname(r.path))
    next if File.exist?(File.join(ROOT, dir, r.path))
    r.build_files.each(&:remove_from_project)
    r.remove_from_project
  end
  # traduzioni in cartelle xx.lproj (per esempio AppShortcuts.strings: con iOS 16 non si può usare il .xcstrings)
  lprojs = Dir.children(File.join(ROOT, dir)).select { |n| n.end_with?('.lproj') && n != 'Base.lproj' }.sort
  lprojs.flat_map { |l| Dir.children(File.join(ROOT, dir, l)).select { |f| f.end_with?('.strings') } }.uniq.each do |name|
    vg = g.children.find { |c| c.isa == 'PBXVariantGroup' && c.name == name } || g.new_variant_group(name)
    lprojs.each do |l|
      path = "#{l}/#{name}"
      next unless File.exist?(File.join(ROOT, dir, path))
      next if vg.files.any? { |r| r.path == path }
      ref = vg.new_reference(path)
      ref.name = l.sub('.lproj', '')
    end
    targets.each { |t| t.resources_build_phase.add_file_reference(vg, true) }
  end
  # file di riferimento (Info.plist, entitlements) visibili nel progetto, senza fasi di build
  Dir.children(File.join(ROOT, dir)).sort.each do |name|
    next unless ['.plist', '.entitlements'].include?(File.extname(name))
    g.files.find { |r| r.path == name } || g.new_reference(name)
  end
end

def embed(target, product, name, spec, path = '')
  phase = target.copy_files_build_phases.find { |p| p.name == name } || target.new_copy_files_build_phase(name)
  phase.symbol_dst_subfolder_spec = spec
  phase.dst_path = path
  return if phase.files_references.include?(product.product_reference)
  bf = phase.add_file_reference(product.product_reference)
  bf.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
end

def depend(target, other)
  target.add_dependency(other) unless target.dependencies.any? { |d| d.target == other }
end

# --- app iPhone
settings(app, {
  'IPHONEOS_DEPLOYMENT_TARGET' => '16.0',
  'CODE_SIGN_ENTITLEMENTS' => 'App/App.entitlements'
})
proj.build_configurations.each { |c| c.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0' }

common = {
  'MARKETING_VERSION' => VERSION, 'CURRENT_PROJECT_VERSION' => BUILD, 'SWIFT_VERSION' => '5.0',
  'GENERATE_INFOPLIST_FILE' => 'YES', 'INFOPLIST_KEY_CFBundleDisplayName' => 'MyTurn',
  'PRODUCT_NAME' => '$(TARGET_NAME)', 'SKIP_INSTALL' => 'YES', 'CODE_SIGN_STYLE' => 'Automatic',
  'ENABLE_PREVIEWS' => 'YES', 'SWIFT_EMIT_LOC_STRINGS' => 'NO'
}

# --- widget iPhone
widget = ensure_target(proj, 'MyTurnWidget', :app_extension, :ios, '16.0')
settings(widget, common.merge({
  'PRODUCT_BUNDLE_IDENTIFIER' => 'app.myturn.widget', 'INFOPLIST_FILE' => 'MyTurnWidget/Info.plist',
  'CODE_SIGN_ENTITLEMENTS' => 'MyTurnWidget/MyTurnWidget.entitlements', 'IPHONEOS_DEPLOYMENT_TARGET' => '16.0',
  'TARGETED_DEVICE_FAMILY' => '1,2', 'SDKROOT' => 'iphoneos',
  'LD_RUNPATH_SEARCH_PATHS' => '$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks'
}))

# --- app Apple Watch
watch = ensure_target(proj, 'MyTurnWatch', :application, :watchos, '10.0')
settings(watch, common.merge({
  'PRODUCT_BUNDLE_IDENTIFIER' => 'app.myturn.watchkitapp', 'INFOPLIST_FILE' => 'MyTurnWatch/Info.plist',
  'INFOPLIST_KEY_WKCompanionAppBundleIdentifier' => 'app.myturn',
  'CODE_SIGN_ENTITLEMENTS' => 'MyTurnWatch/MyTurnWatch.entitlements', 'WATCHOS_DEPLOYMENT_TARGET' => '10.0',
  'SDKROOT' => 'watchos', 'SUPPORTED_PLATFORMS' => 'watchos watchsimulator', 'TARGETED_DEVICE_FAMILY' => '4',
  'ASSETCATALOG_COMPILER_APPICON_NAME' => 'AppIcon',
  'LD_RUNPATH_SEARCH_PATHS' => '$(inherited) @executable_path/Frameworks'
}))

# --- complicazioni Apple Watch
wwidget = ensure_target(proj, 'MyTurnWatchWidget', :app_extension, :watchos, '10.0')
settings(wwidget, common.merge({
  'PRODUCT_BUNDLE_IDENTIFIER' => 'app.myturn.watchkitapp.widget', 'INFOPLIST_FILE' => 'MyTurnWatchWidget/Info.plist',
  'CODE_SIGN_ENTITLEMENTS' => 'MyTurnWatchWidget/MyTurnWatchWidget.entitlements', 'WATCHOS_DEPLOYMENT_TARGET' => '10.0',
  'SDKROOT' => 'watchos', 'SUPPORTED_PLATFORMS' => 'watchos watchsimulator', 'TARGETED_DEVICE_FAMILY' => '4',
  'LD_RUNPATH_SEARCH_PATHS' => '$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks'
}))

# --- lingue delle traduzioni native (Siri e Comandi rapidi): così iOS usa anche l'italiano per i testi di sistema
proj.root_object.known_regions = (proj.root_object.known_regions + %w[en Base it fr de es pt]).uniq

# --- file nelle cartelle
sync(proj, 'App', [app])
sync(proj, 'Shared', [app, widget, watch, wwidget])
sync(proj, 'SharedWidget', [widget, wwidget])
sync(proj, 'MyTurnWidget', [widget])
sync(proj, 'MyTurnWatch', [watch])
sync(proj, 'MyTurnWatchWidget', [wwidget])

# --- dentro l'app: widget in PlugIns, app dell'orologio in Watch; complicazioni dentro l'app dell'orologio
depend(app, widget)
depend(app, watch)
depend(watch, wwidget)
embed(app, widget, 'Embed Foundation Extensions', :plug_ins)
embed(app, watch, 'Embed Watch Content', :products_directory, '$(CONTENTS_FOLDER_PATH)/Watch')
embed(watch, wwidget, 'Embed Foundation Extensions', :plug_ins)

proj.save
puts "Progetto aggiornato: #{proj.targets.map(&:name).join(', ')}"
